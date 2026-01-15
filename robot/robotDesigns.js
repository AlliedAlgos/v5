// robotDesigns.js

// 1. Initialize Supabase Client
const SUPABASE_URL = "https://eyxhddkoqotedgucpfbz.supabase.co";
// Double check this key in Supabase -> Settings -> API -> anon public
const SUPABASE_ANON_KEY = "sb_publishable_h4nlL7bfvrg-amPOoqyhTw_CJjsVfJc"; 

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DISCORD_WEBHOOK_URL = "YOUR_DISCORD_WEBHOOK_URL";

$(function () {
    // Load components and trigger scroll for the pill design
    $("#navbar").load("../layout/navbar.html", () => {
        window.dispatchEvent(new Event('scroll'));
    });
    $("#footer").load("../layout/footer.html");

    fetchRobotDesigns();
});

async function fetchRobotDesigns() {
    const container = document.getElementById('robot-cards-container');
    
    // Check if container exists before proceeding
    if (!container) return;

    try {
        const { data, error } = await _supabase
            .from('robot_designs') // MUST match your table name exactly
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = `<p class="col-span-full text-center text-zinc-500">No designs found.</p>`;
            return;
        }

        renderRobotCards(data);
    } catch (err) {
        console.error("Fetch error:", err);
        container.innerHTML = `<p class="col-span-full text-center text-red-500 uppercase text-xs font-bold tracking-widest">Database Sync Failed: ${err.message}</p>`;
    }
}

function renderRobotCards(designs) {
    const container = document.getElementById('robot-cards-container');
    container.innerHTML = '';

    designs.forEach(robot => {
        const images = Array.isArray(robot.images) ? robot.images : JSON.parse(robot.images);
        
        const card = document.createElement('div');
        // Removed the width constraints so it fills the 1-column grid
        card.className = "group bg-zinc-900/30 backdrop-blur-xl border border-white/5 rounded-[3rem] overflow-hidden p-4 sm:p-8 transition-all duration-700 hover:border-blue-500/40 flex flex-col gap-8";

        card.innerHTML = `
            <div class="relative w-full aspect-video sm:aspect-[21/9] rounded-[2rem] overflow-hidden bg-black/40 border border-white/5">
                <div id="carousel-${robot.id}" class="h-full w-full">
                    ${images.map((img, i) => `
                        <img src="${img.src}" alt="${img.alt}" 
                        class="carousel-img absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === 0 ? 'opacity-100' : 'opacity-0'}">
                    `).join('')}
                </div>
                
                ${images.length > 1 ? `
                <div class="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                    <button onclick="moveCarousel('${robot.id}', -1)" class="pointer-events-auto w-12 h-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-blue-600 hover:scale-110 transition-all flex items-center justify-center">❮</button>
                    <button onclick="moveCarousel('${robot.id}', 1)" class="pointer-events-auto w-12 h-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-blue-600 hover:scale-110 transition-all flex items-center justify-center">❯</button>
                </div>
                ` : ''}
            </div>

            <div class="flex flex-col lg:flex-row justify-between items-end gap-8 px-4 pb-4">
                <div class="flex-grow">
                    <span class="text-blue-500 font-bold tracking-[0.3em] text-[10px] uppercase mb-2 block">Allied Engineering</span>
                    <h2 class="text-4xl md:text-6xl font-bold tracking-tighter italic text-white uppercase">${robot.heading}</h2>
                </div>
                
                <div class="w-full lg:w-96 space-y-4">
                    <div class="relative">
                        <input type="text" id="teamInput-${robot.id}" placeholder="ENTER TEAM ID TO UNLOCK" 
                        class="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-zinc-600 font-mono text-sm">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <button onclick="handleDownload('${robot.id}', '${robot.heading}', '${robot.download_path}')"
                            class="py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-600/20">
                            Get Build PDF
                        </button>
                        <a href="${robot.cad_link}" target="_blank" 
                            class="py-4 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white text-center rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all">
                            Studio CAD
                        </a>
                    </div>
                    <p id="status-${robot.id}" class="text-[10px] font-bold uppercase tracking-widest text-center min-h-[1rem] text-zinc-500"></p>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Carousel Function
window.moveCarousel = (robotId, direction) => {
    const wrapper = document.getElementById(`carousel-${robotId}`);
    const images = wrapper.querySelectorAll('.carousel-img');
    let currentIndex = Array.from(images).findIndex(img => img.classList.contains('opacity-100'));

    images[currentIndex].classList.replace('opacity-100', 'opacity-0');
    currentIndex = (currentIndex + direction + images.length) % images.length;
    images[currentIndex].classList.replace('opacity-0', 'opacity-100');
};

// Download Function
window.handleDownload = async (id, heading, path) => {
    const team = document.getElementById(`teamInput-${id}`).value.trim();
    const status = document.getElementById(`status-${id}`);

    if (!team) {
        status.textContent = "Error: Team ID Required";
        status.className = "mt-4 text-[10px] font-bold text-red-500 uppercase tracking-widest";
        return;
    }

    const a = document.createElement('a');
    a.href = path;
    a.download = path.split('/').pop();
    a.click();

    status.textContent = "Logging...";
    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: `📥 **Robot Downloaded**\n**Team:** ${team}\n**Design:** ${heading}` })
        });
        status.textContent = "Logged Successfully";
        status.className = "mt-4 text-[10px] font-bold text-blue-500 uppercase tracking-widest";
    } catch (e) {
        status.textContent = "Log Failed";
    }
};