import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { job_listing_id } = await req.json();
    if (!job_listing_id) return Response.json({ error: 'job_listing_id required' }, { status: 400 });

    // Fetch job and all active resumes
    const [job, resumes] = await Promise.all([
      base44.asServiceRole.entities.Listing.get(job_listing_id),
      base44.asServiceRole.entities.Resume.filter({ is_active: true }),
    ]);

    if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });

    const jobDescription = `Title: ${job.title}\nDescription: ${job.description || ''}\nCategory: ${job.category}\nCity: ${job.location_city || ''}\nType: ${job.job_type || ''}\nSalary: ${job.job_salary_min || 0}-${job.job_salary_max || 0}\nBenefits: ${job.job_benefits || ''}`;

    const candidateList = resumes.map((r, i) => (
      `[${i}] ${r.full_name} | Title: ${r.title || 'N/A'} | Skills: ${(r.skills || []).join(', ')} | Exp: ${r.experience_years || 0}yr | Location: ${r.location || 'N/A'} | Pref: ${r.job_type_preference || 'any'} | Salary: $${r.salary_expectation || 'N/A'}`
    )).join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a recruiter AI. Match candidates to this job listing and score them 0-100.\n\nJOB:\n${jobDescription}\n\nCANDIDATES:\n${candidateList}\n\nReturn ranked matches. Consider skills alignment, location, experience, salary fit, and job type preference.`,
      response_json_schema: {
        type: "object",
        properties: {
          matches: {
            type: "array",
            items: {
              type: "object",
              properties: {
                index: { type: "number" },
                score: { type: "number" },
                reason: { type: "string" }
              }
            }
          }
        }
      }
    });

    const matches = (result.matches || [])
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(m => ({
        ...m,
        resume: resumes[m.index] || null
      }))
      .filter(m => m.resume);

    return Response.json({ matches, job_title: job.title });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});