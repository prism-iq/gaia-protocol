# -*- coding: utf-8 -*-
"""
sources scientifiques
open access only
10 ans d'xp
"""

PHI = 1.618033988749895

# neuroscience + phi
NEURO_PHI = {
    "brain_waves_phi": "https://www.researchgate.net/publication/222143648_The_golden_mean_as_clock_cycle_of_brain_waves",
    "phi_eeg_sync": "https://www.researchgate.net/publication/42638427_When_frequencies_never_synchronize_The_golden_mean_and_the_resting_EEG",
    "integrated_info": "https://www.nature.com/articles/s42003-023-05063-y",
    "skull_phi": "https://neurosciencenews.com/golden-ratio-human-skull-15034/",
}

# jung + neuroscience
JUNG_NEURO = {
    "eigenmodes_archetypes_2025": "https://academic.oup.com/nc/article/2025/1/niaf039/8293123",
    "eigenmodes_pmc": "https://pmc.ncbi.nlm.nih.gov/articles/PMC12535262/",
    "jung_collected_works": "https://www.jungiananalysts.org.uk/wp-content/uploads/2018/07/C.-G.-Jung-Collected-Works-Volume-9i_-The-Archetypes-of-the-Collective-Unconscious.pdf",
    "jung_archive": "https://ia801406.us.archive.org/9/items/in.ernet.dli.2015.185498/2015.185498.The-Archetypes-And-Collective-Unconscious_text.pdf",
    "unconscious_review": "https://www.researchgate.net/publication/335260095",
}

# quantum cognition
QUANTUM_COGNITION = {
    "quantum_circuits_cognition": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10138279/",
    "quantum_bayesian_bias": "https://www.nature.com/articles/s41598-022-13757-2",
    "quantum_markov_decision": "https://www.mdpi.com/1099-4300/22/9/990",
    "quantum_cognition_overview_2025": "https://link.springer.com/article/10.3758/s13423-025-02675-9",
    "mdpi_special_issue": "https://www.mdpi.com/journal/entropy/special_issues/quan_cognition",
}

# consciousness + emergence
CONSCIOUSNESS = {
    "thresholds_consciousness": "https://www.researchgate.net/publication/375112900",
    "consciousness_emergence_pmc": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7597170/",
    "ai_consciousness_phenomenal": "https://openreview.net/pdf?id=j9wKyda3jy",
    "artificial_consciousness_hal": "https://hal.science/hal-04670602v1/document",
    "consciousness_frontiers": "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2020.01041/full",
    "intro_artificial_consciousness": "https://arxiv.org/pdf/2503.05823",
}

# music + neuroscience
MUSIC_NEURO = {
    "music_mental_health_pmc": "https://pmc.ncbi.nlm.nih.gov/articles/PMC9453743/",
    "fnirs_music_2024": "https://hal.science/hal-04747622v1/file/Curzel%20et%20al_2024_Lights%20on%20music%20cognition.pdf",
    "cognitive_neuroscience_music_book": "https://hugoribeiro.com.br/biblioteca-digital/Peretez_Zatorre-Neuroscience_of_Music.pdf",
    "neuroscience_music_review": "https://www.psychiatria-danubina.com/UserDocsImages/pdf/dnb_vol30_noSuppl%207/dnb_vol30_noSuppl%207_588.pdf",
    "music_memory_2025": "https://rijournals.com/wp-content/uploads/2025/01/RIJCIAM-41-2025-P9.pdf",
}

# free music sources
MUSIC_FREE = {
    "free_music_archive": "https://freemusicarchive.org/",
    "archive_org_cc": "https://archive.org/details/CcMusicForCommercialUse",
    "pixabay_music": "https://pixabay.com/music/",
    "kevin_macleod_cc": "https://kevinmacleod.bandcamp.com/album/complete-collection-creative-commons",
    "bandcamp_cc_tag": "https://bandcamp.com/discover/creative-commons",
}

# business + strategy
BUSINESS = {
    "startup": "idea mvp iterate pivot scale",
    "marketing": "attention conversion retention",
    "sales": "qualify present close follow",
    "finance": "revenue cost profit cashflow",
    "ops": "process automate optimize",
    "product": "problem solution fit market",
    "growth": "acquisition activation retention referral revenue",
    "negotiation": "anchor listen trade close",
    "leadership": "vision delegate trust empower",
    "management": "plan organize lead control",
}

# all sources merged
ALL_SOURCES = {
    **NEURO_PHI,
    **JUNG_NEURO,
    **QUANTUM_COGNITION,
    **CONSCIOUSNESS,
    **MUSIC_NEURO,
    **MUSIC_FREE,
}

# domains = 10 yrs xp each
DOMAINS_10YRS = [
    "neuroscience", "psychology", "physics", "math", "biology",
    "music", "art", "philosophy", "linguistics", "anthropology",
    "economics", "business", "marketing", "sales", "finance",
    "law", "medicine", "engineering", "architecture", "design",
    "cooking", "agriculture", "ecology", "chemistry", "astronomy",
    "history", "sociology", "politics", "education", "sports",
    "meditation", "yoga", "martial_arts", "crafts", "writing",
]

# key findings summary
KNOWLEDGE = {
    "phi_brain": "brain waves = superposition of n harmonics * 2φ, phi = point of resonance",
    "phi_decoupling": "phi ratio 1.618:1 provides max desynchronized state in neural oscillations",
    "archetypes_eigenmodes": "archetypes = eigenmodes of deep brain, emergent patterns of predictive dynamics",
    "archetypes_limbic": "collective unconscious from subcortical: thalamus + limbic system",
    "quantum_order_effects": "question order affects answers, modeled as quantum projections",
    "consciousness_phi_metric": "integrated information theory uses Φ metric for consciousness level",
    "consciousness_noise": "consciousness emerges at intermediate noise + network correlation levels",
    "music_bilateral": "music uses both hemispheres, right dominant but left involved",
    "music_memory": "music enhances memory retrieval, used in rehabilitation",
}

if __name__ == "__main__":
    print(f"sources: {len(ALL_SOURCES)}")
    print(f"knowledge points: {len(KNOWLEDGE)}")
    for k, v in KNOWLEDGE.items():
        print(f"  {k}: {v[:50]}...")
