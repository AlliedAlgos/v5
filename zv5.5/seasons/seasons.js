import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://eyxhddkoqotedgucpfbz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_h4nlL7bfvrg-amPOoqyhTw_CJjsVfJc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function statCard(label, value) {
    return `
        <div class="bg-white/5 border border-white/5 backdrop-blur-2xl rounded-2xl p-6 text-center transition-all duration-300 hover:border-blue-500/30">
            <p class="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">${label}</p>
            <h3 class="text-4xl font-bold tracking-tighter italic text-white">${value || "0"}</h3>
        </div>
    `;
}

function renderCollage(images) {
    if (!images || images.length === 0) return '';
    
    // Bento Grid Layout
    return `
        <div class="mt-16 grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-4 h-[400px] md:h-[600px]">
            <div class="col-span-2 row-span-2 rounded-3xl overflow-hidden border border-white/10 group">
                <img src="${images[0]}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
            </div>
            <div class="col-span-1 row-span-1 rounded-3xl overflow-hidden border border-white/10 group">
                <img src="${images[1] || images[0]}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
            </div>
            <div class="col-span-1 row-span-1 rounded-3xl overflow-hidden border border-white/10 group">
                <img src="${images[2] || images[0]}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
            </div>
            <div class="hidden md:block col-span-1 row-span-2 rounded-3xl overflow-hidden border border-white/10 group">
                <img src="${images[3] || images[0]}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
            </div>
        </div>
    `;
}

async function renderSeasons() {
    const currentContainer = document.getElementById("current-season");
    const pastContainer = document.getElementById("past-seasons-container");

    try {
        const { data: seasons, error } = await supabase
            .from('seasons')
            .select('*')
            .order('year', { ascending: false });

        if (error) throw error;

        const current = seasons.find(s => s.is_current === true) || seasons[0];
        const pastSeasons = seasons.filter(s => s.id !== current.id);

        if (currentContainer) {
            currentContainer.innerHTML = `
                <div class="mb-12 text-center md:text-left">
                    <span class="text-blue-400 font-bold tracking-[0.3em] text-xs uppercase mb-4 block">Active Mission</span>
                    <h2 class="text-6xl md:text-7xl font-bold tracking-tighter italic text-white leading-tight">
                        ${current.year} <br class="hidden md:block"> <span class="text-blue-500">${current.title}</span>
                    </h2>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                    ${statCard("Hours Spent", current.hours_spent)}
                    ${statCard("People Impacted", current.people_impacted)}
                    ${statCard("Missions Completed", current.missions_completed)}
                </div>
                <div class="bg-white/5 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-xl border-l-4 border-l-blue-500">
                    <p class="text-xl md:text-2xl text-zinc-300 leading-relaxed italic font-light tracking-tight">
                        "${current.description}"
                    </p>
                </div>
                ${renderCollage(current.collage_images)}
            `;
        }

        if (pastContainer) {
            pastContainer.innerHTML = "";
            pastSeasons.forEach((s, i) => {
                const isEven = i % 2 === 0;
                const reverse = isEven ? "md:flex-row" : "md:flex-row-reverse";

                pastContainer.innerHTML += `
                    <div class="w-full border-t border-white/5 py-24 group transition-colors duration-500 hover:bg-white/[0.01] animate-fade-up">
                        <div class="max-w-7xl mx-auto px-6 flex flex-col ${reverse} gap-16 items-center">
                            <div class="w-full md:w-3/5">
                                <div class="aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                                    <img src="${s.image_url}" alt="${s.title}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                </div>
                            </div>
                            <div class="w-full md:w-2/5 space-y-6">
                                <div class="flex items-center gap-3">
                                    <span class="h-[1px] w-8 bg-blue-500"></span>
                                    <span class="text-blue-500 font-bold tracking-[0.4em] text-[10px] uppercase">${s.year}</span>
                                </div>
                                <h2 class="text-5xl font-bold tracking-tighter italic text-white">${s.title}</h2>
                                <p class="text-zinc-400 leading-relaxed text-lg font-light">${s.description}</p>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
    } catch (err) {
        console.error("Supabase error:", err.message);
    }
}

document.addEventListener("DOMContentLoaded", renderSeasons);