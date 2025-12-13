import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import type { Bindings, Language, Job, Stats } from './types'
import { t } from './i18n'

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// =========================
// API Routes
// =========================

// Get all jobs with filters
app.get('/api/jobs', async (c) => {
  const { env } = c
  const targetType = c.req.query('target_type')
  const municipality = c.req.query('municipality')
  const category = c.req.query('category')
  const employmentType = c.req.query('employment_type')
  const search = c.req.query('search')

  let query = `
    SELECT j.*, m.name_ko as municipality_name, cat.name_ko as category_name
    FROM jobs j
    LEFT JOIN municipalities m ON j.municipality_id = m.id
    LEFT JOIN job_categories cat ON j.category_id = cat.id
    WHERE j.status = 'active'
  `
  const params: any[] = []

  if (targetType && targetType !== 'all') {
    query += ` AND (j.target_type = ? OR j.target_type = 'all')`
    params.push(targetType)
  }

  if (municipality) {
    query += ` AND j.municipality_id = ?`
    params.push(municipality)
  }

  if (category) {
    query += ` AND j.category_id = ?`
    params.push(category)
  }

  if (employmentType) {
    query += ` AND j.employment_type = ?`
    params.push(employmentType)
  }

  if (search) {
    query += ` AND (j.title_ko LIKE ? OR j.description_ko LIKE ? OR j.company_name LIKE ?)`
    const searchPattern = `%${search}%`
    params.push(searchPattern, searchPattern, searchPattern)
  }

  query += ` ORDER BY j.created_at DESC`

  const stmt = env.DB.prepare(query)
  const { results } = await stmt.bind(...params).all()

  return c.json(results)
})

// Get job by ID
app.get('/api/jobs/:id', async (c) => {
  const { env } = c
  const id = c.req.param('id')

  // Increment views
  await env.DB.prepare('UPDATE jobs SET views = views + 1 WHERE id = ?').bind(id).run()

  const { results } = await env.DB.prepare(`
    SELECT j.*, m.name_ko as municipality_name, cat.name_ko as category_name
    FROM jobs j
    LEFT JOIN municipalities m ON j.municipality_id = m.id
    LEFT JOIN job_categories cat ON j.category_id = cat.id
    WHERE j.id = ?
  `).bind(id).all()

  if (results.length === 0) {
    return c.json({ error: 'Job not found' }, 404)
  }

  return c.json(results[0])
})

// Get municipalities
app.get('/api/municipalities', async (c) => {
  const { env } = c
  const { results } = await env.DB.prepare('SELECT * FROM municipalities ORDER BY name_ko').all()
  return c.json(results)
})

// Get job categories
app.get('/api/categories', async (c) => {
  const { env } = c
  const { results } = await env.DB.prepare('SELECT * FROM job_categories ORDER BY name_ko').all()
  return c.json(results)
})

// Get statistics
app.get('/api/stats', async (c) => {
  const { env } = c

  const totalJobsResult = await env.DB.prepare('SELECT COUNT(*) as count FROM jobs WHERE status = "active"').first()
  const totalApplicationsResult = await env.DB.prepare('SELECT COUNT(*) as count FROM applications').first()
  const totalUsersResult = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first()

  const jobsByTypeResult = await env.DB.prepare(`
    SELECT target_type, COUNT(*) as count 
    FROM jobs 
    WHERE status = 'active' 
    GROUP BY target_type
  `).all()

  const applicationsByStatusResult = await env.DB.prepare(`
    SELECT status, COUNT(*) as count 
    FROM applications 
    GROUP BY status
  `).all()

  const jobsByMunicipalityResult = await env.DB.prepare(`
    SELECT m.name_ko as municipality_name, COUNT(j.id) as count
    FROM jobs j
    LEFT JOIN municipalities m ON j.municipality_id = m.id
    WHERE j.status = 'active'
    GROUP BY j.municipality_id
  `).all()

  const stats: Stats = {
    total_jobs: (totalJobsResult as any)?.count || 0,
    total_applications: (totalApplicationsResult as any)?.count || 0,
    total_users: (totalUsersResult as any)?.count || 0,
    jobs_by_type: jobsByTypeResult.results as any,
    applications_by_status: applicationsByStatusResult.results as any,
    jobs_by_municipality: jobsByMunicipalityResult.results as any,
  }

  return c.json(stats)
})

// Apply for a job
app.post('/api/applications', async (c) => {
  const { env } = c
  const { user_id, job_id, cover_letter } = await c.req.json()

  const result = await env.DB.prepare(`
    INSERT INTO applications (user_id, job_id, cover_letter)
    VALUES (?, ?, ?)
  `).bind(user_id, job_id, cover_letter).run()

  return c.json({ id: result.meta.last_row_id, message: 'Application submitted successfully' })
})

// =========================
// Frontend Routes
// =========================

app.get('/', (c) => {
  const lang = (c.req.query('lang') as Language) || 'ko'

  return c.html(`
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t(lang, 'app_title')}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          body { 
            font-family: 'Noto Sans KR', sans-serif; 
            -webkit-font-smoothing: antialiased;
          }
          .job-card { 
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .job-card:active { 
            transform: scale(0.98);
          }
          @media (min-width: 768px) {
            .job-card:hover { 
              transform: translateY(-4px); 
              box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
            }
          }
          .stat-card { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          }
          /* 모바일 최적화 */
          @media (max-width: 640px) {
            .mobile-compact { padding: 0.75rem !important; }
            .mobile-text-sm { font-size: 0.875rem !important; }
            .mobile-text-xs { font-size: 0.75rem !important; }
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
                <div class="flex justify-between items-center gap-2">
                    <div class="flex-1 min-w-0">
                        <h1 class="text-base sm:text-xl md:text-2xl font-bold truncate">
                            <i class="fas fa-briefcase mr-1 sm:mr-2 text-sm sm:text-base"></i>
                            <span class="hidden sm:inline">${t(lang, 'app_title')}</span>
                            <span class="sm:hidden">일자리 매칭</span>
                        </h1>
                        <p class="text-blue-100 text-xs sm:text-sm mt-0.5 sm:mt-1 hidden sm:block">${t(lang, 'app_subtitle')}</p>
                    </div>
                    <div>
                        <select id="langSelect" class="bg-white text-gray-800 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg shadow text-xs sm:text-sm">
                            <option value="ko" ${lang === 'ko' ? 'selected' : ''}>한국어</option>
                            <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
                            <option value="zh" ${lang === 'zh' ? 'selected' : ''}>中文</option>
                            <option value="ja" ${lang === 'ja' ? 'selected' : ''}>日本語</option>
                            <option value="vi" ${lang === 'vi' ? 'selected' : ''}>Tiếng Việt</option>
                            <option value="mn" ${lang === 'mn' ? 'selected' : ''}>Монгол</option>
                            <option value="ru" ${lang === 'ru' ? 'selected' : ''}>Русский</option>
                        </select>
                    </div>
                </div>
            </div>
        </header>

        <div class="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-6">
            <!-- Statistics Dashboard -->
            <div id="statsSection" class="mb-4 sm:mb-6">
                <h2 class="text-lg sm:text-xl font-bold mb-3 px-1">
                    <i class="fas fa-chart-bar mr-1.5 text-sm sm:text-base"></i>
                    <span class="hidden sm:inline">${t(lang, 'stats_title')}</span>
                    <span class="sm:hidden">통계</span>
                </h2>
                <div id="statsCards" class="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                    <!-- Stats will be loaded here -->
                </div>
            </div>

            <!-- Filter Section -->
            <div class="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                    <div class="col-span-2 sm:col-span-1">
                        <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                            ${t(lang, 'search_jobs')}
                        </label>
                        <input type="text" id="searchInput" 
                               class="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                               placeholder="${t(lang, 'search_placeholder')}">
                    </div>
                    <div>
                        <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                            ${t(lang, 'employment_type')}
                        </label>
                        <select id="targetTypeSelect" class="w-full px-2 py-2 text-sm border rounded-lg">
                            <option value="all">${t(lang, 'all')}</option>
                            <option value="senior">${t(lang, 'senior_jobs')}</option>
                            <option value="female">${t(lang, 'female_jobs')}</option>
                            <option value="disabled">${t(lang, 'disabled_jobs')}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                            ${t(lang, 'municipality')}
                        </label>
                        <select id="municipalitySelect" class="w-full px-2 py-2 text-sm border rounded-lg">
                            <option value="">${t(lang, 'all')}</option>
                        </select>
                    </div>
                    <div class="col-span-2 sm:col-span-1">
                        <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                            ${t(lang, 'category')}
                        </label>
                        <select id="categorySelect" class="w-full px-2 py-2 text-sm border rounded-lg">
                            <option value="">${t(lang, 'all')}</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Jobs List -->
            <div id="jobsList" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <!-- Jobs will be loaded here -->
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          const lang = '${lang}';
          
          // Language selector
          document.getElementById('langSelect').addEventListener('change', (e) => {
            window.location.href = '/?lang=' + e.target.value;
          });

          // Load statistics
          async function loadStats() {
            try {
              const response = await axios.get('/api/stats');
              const stats = response.data;
              
              const statsHTML = \`
                <div class="stat-card text-white rounded p-1.5 sm:p-5">
                  <div class="flex flex-col items-center text-center">
                    <i class="fas fa-briefcase text-xs sm:text-3xl opacity-70"></i>
                    <p class="text-blue-100 text-[8px] sm:text-sm">일자리</p>
                    <p class="text-sm sm:text-3xl font-bold">\${stats.total_jobs}</p>
                  </div>
                </div>
                <div class="stat-card text-white rounded p-1.5 sm:p-5">
                  <div class="flex flex-col items-center text-center">
                    <i class="fas fa-file-alt text-xs sm:text-3xl opacity-70"></i>
                    <p class="text-blue-100 text-[8px] sm:text-sm">지원</p>
                    <p class="text-sm sm:text-3xl font-bold">\${stats.total_applications}</p>
                  </div>
                </div>
                <div class="stat-card text-white rounded p-1.5 sm:p-5">
                  <div class="flex flex-col items-center text-center">
                    <i class="fas fa-users text-xs sm:text-3xl opacity-70"></i>
                    <p class="text-blue-100 text-[8px] sm:text-sm">사용자</p>
                    <p class="text-sm sm:text-3xl font-bold">\${stats.total_users}</p>
                  </div>
                </div>
              \`;
              
              document.getElementById('statsCards').innerHTML = statsHTML;
            } catch (error) {
              console.error('Error loading stats:', error);
            }
          }

          // Load municipalities
          async function loadMunicipalities() {
            try {
              const response = await axios.get('/api/municipalities');
              const select = document.getElementById('municipalitySelect');
              response.data.forEach(m => {
                const option = document.createElement('option');
                option.value = m.id;
                option.textContent = m['name_${lang}'] || m.name_ko;
                select.appendChild(option);
              });
            } catch (error) {
              console.error('Error loading municipalities:', error);
            }
          }

          // Load categories
          async function loadCategories() {
            try {
              const response = await axios.get('/api/categories');
              const select = document.getElementById('categorySelect');
              response.data.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = c['name_${lang}'] || c.name_ko;
                select.appendChild(option);
              });
            } catch (error) {
              console.error('Error loading categories:', error);
            }
          }

          // Load jobs
          async function loadJobs() {
            try {
              const targetType = document.getElementById('targetTypeSelect').value;
              const municipality = document.getElementById('municipalitySelect').value;
              const category = document.getElementById('categorySelect').value;
              const search = document.getElementById('searchInput').value;

              const params = new URLSearchParams();
              if (targetType !== 'all') params.append('target_type', targetType);
              if (municipality) params.append('municipality', municipality);
              if (category) params.append('category', category);
              if (search) params.append('search', search);

              const response = await axios.get('/api/jobs?' + params.toString());
              const jobs = response.data;

              if (jobs.length === 0) {
                document.getElementById('jobsList').innerHTML = \`
                  <div class="col-span-full text-center py-6 sm:py-12">
                    <i class="fas fa-inbox text-2xl sm:text-6xl text-gray-300 mb-2"></i>
                    <p class="text-gray-500 text-xs sm:text-base">일자리 없음</p>
                  </div>
                \`;
                return;
              }

              const jobsHTML = jobs.map(job => \`
                <div class="job-card bg-white rounded shadow p-2 sm:p-5 cursor-pointer">
                  <div class="flex justify-between items-start mb-1 sm:mb-3 gap-1">
                    <h3 class="text-[11px] sm:text-lg font-bold text-gray-800 flex-1 line-clamp-1">\${job['title_${lang}'] || job.title_ko}</h3>
                    <span class="px-1 py-0.5 sm:px-3 sm:py-1 bg-blue-100 text-blue-800 text-[8px] sm:text-xs font-semibold rounded-full whitespace-nowrap">
                      \${job.target_type === 'all' ? '전체' : job.target_type === 'senior' ? '노령' : job.target_type === 'female' ? '여성' : '장애'}
                    </span>
                  </div>
                  <p class="text-gray-600 text-[9px] sm:text-sm mb-1.5 line-clamp-1">\${job['description_${lang}'] || job.description_ko}</p>
                  <div class="space-y-0.5 sm:space-y-2 text-[9px] sm:text-sm text-gray-600">
                    <div class="flex items-center gap-1">
                      <i class="fas fa-building w-2.5 text-blue-500 flex-shrink-0 text-[8px]"></i>
                      <span class="truncate">\${job.company_name}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <i class="fas fa-map-marker-alt w-2.5 text-blue-500 flex-shrink-0 text-[8px]"></i>
                      <span class="truncate">\${job.location}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <i class="fas fa-won-sign w-2.5 text-blue-500 flex-shrink-0 text-[8px]"></i>
                      <span class="truncate">\${job.salary_min?.toLocaleString()}~\${job.salary_max?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div class="mt-1.5 pt-1.5 border-t flex justify-between items-center gap-1">
                    <span class="text-[8px] sm:text-xs text-gray-500 flex items-center gap-0.5">
                      <i class="fas fa-eye text-[7px]"></i>
                      \${job.views || 0}
                    </span>
                    <button onclick="applyJob(\${job.id})" class="px-2 py-0.5 sm:px-4 sm:py-2 bg-blue-600 text-white text-[9px] sm:text-sm rounded hover:bg-blue-700 active:scale-95 transition whitespace-nowrap">
                      지원
                    </button>
                  </div>
                </div>
              \`).join('');

              document.getElementById('jobsList').innerHTML = jobsHTML;
            } catch (error) {
              console.error('Error loading jobs:', error);
            }
          }

          // Apply for job
          function applyJob(jobId) {
            alert('지원 기능은 사용자 로그인 후 이용 가능합니다. (Job ID: ' + jobId + ')');
          }

          // Event listeners
          document.getElementById('targetTypeSelect').addEventListener('change', loadJobs);
          document.getElementById('municipalitySelect').addEventListener('change', loadJobs);
          document.getElementById('categorySelect').addEventListener('change', loadJobs);
          document.getElementById('searchInput').addEventListener('input', debounce(loadJobs, 500));

          // Debounce function
          function debounce(func, wait) {
            let timeout;
            return function(...args) {
              clearTimeout(timeout);
              timeout = setTimeout(() => func.apply(this, args), wait);
            };
          }

          // Initialize
          loadStats();
          loadMunicipalities();
          loadCategories();
          loadJobs();
        </script>
    </body>
    </html>
  `)
})

export default app
