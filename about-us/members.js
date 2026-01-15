import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://eyxhddkoqotedgucpfbz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_h4nlL7bfvrg-amPOoqyhTw_CJjsVfJc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function renderMembers() {
  const container = document.getElementById("members-container");
  if (!container) return;
  
  container.innerHTML = "<p class='text-zinc-500 animate-pulse col-span-full text-center'>Syncing Team Data...</p>";

  const { data: members, error } = await supabase
    .from("members")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    container.innerHTML = "<p class='text-red-500 col-span-full text-center'>Connection Error.</p>";
    return;
  }

  container.innerHTML = "";

  members.forEach((member, index) => {
    const card = document.createElement("div");
    card.className = "member-card animate-fade-in";
    card.style.animationDelay = `${index * 100}ms`;

    card.innerHTML = `
      <div class="profile-container">
        <img 
          src="${member.img || 'https://via.placeholder.com/200'}" 
          alt="${member.name}" 
          class="profile-image" 
        />
      </div>
      <div class="flex flex-col items-center">
        <h3 class="text-2xl font-bold tracking-tighter italic text-white">${member.name}</h3>
        <p class="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-500 mt-1">${member.role}</p>
        <p class="mt-4 text-sm text-zinc-400 leading-relaxed line-clamp-3">
          ${member.des || ""}
        </p>
      </div>
    `;
    container.appendChild(card);
  });
}

window.renderMembers = renderMembers;