<script>
  import { onMount } from 'svelte';
  import grainTexture from '$lib/images/black-linen.png';
  let isDarkMode = false;

  //const grainTexture = 'https://www.transparenttextures.com/patterns/sandpaper.png';
  //const grainTexture = 'https://www.transparenttextures.com/patterns/black-linen.png';
  
  function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }
  }

  onMount(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      isDarkMode = true;
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  });
</script>

<div class="app-container">
  <nav class="toolbar">
    <button on:click={toggleTheme} class="theme-toggle">
      {isDarkMode ? '📜 Light Papyrus' : '🕯️ Night Vellum'}
    </button>
  </nav>
<div id="gospel-columns-container" class="flex flex-wrap items-stretch"
style="--grainTexture: url('{grainTexture}')">
  <main class="manuscript-wrapper matthew ">
    <article class="manuscript-page">
     <div class="manuscript-background"
         >
    </div>
      <header>
        <h1 class="rubric">ΚΑΤΑ ΜΑΘΘΑΙΟΝ</h1>
      </header>

      <section class="greek-text">
        <p><span class="rubric">1:1</span> Βίβλος γενέσεως Ἰησοῦ Χριστοῦ υἱοῦ Δαυὶδ υἱοῦ Ἀβραάμ.</p>
        <p><span class="rubric">1:2</span> Ἀβραὰμ ἐγέννησεν τὸν Ἰσαάκ, Ἰσαάκ δὲ ἐγέννησεν τὸν Ἰακώβ, Ἰακὼβ δὲ ἐγέννησεν τὸν Ἰούδαν καὶ τοὺς ἀδελφοὺς αὐτοῦ...</p>
      </section>
    </article>
  </main>

  <main class="manuscript-wrapper mark ">
    <article class="manuscript-page">
     <div class="manuscript-background"
         >
    </div>
      <header>
        <h1 class="rubric">ΚΑΤΑ ΜΑΡΚΟΝ</h1>
      </header>

      <section class="greek-text">
        <p><span class="rubric">1:1</span> Ἀρχὴ τοῦ εὐαγγελίου Ἰησοῦ χριστοῦ.</p>
        <p><span class="rubric">1:2</span> Καθὼς γέγραπται ἐν τῷ Ἠσαΐᾳ τῷ προφήτῃ· Ἰδοὺ ἀποστέλλω τὸν ἄγγελόν μου πρὸ προσώπου σου, ὃς κατασκευάσει τὴν ὁδόν σου·</p>
      </section>
    </article>
  </main>

  <main class="manuscript-wrapper luke  ">
    <article class="manuscript-page">
     <div class="manuscript-background"
         >
    </div>
      <header>
        <h1 class="rubric">ΚΑΤΑ ΛΟΥΚΑΝ</h1>
      </header>

      <section class="greek-text">
        <p><span class="rubric">1:1</span> Ἐπειδήπερ πολλοὶ ἐπεχείρησαν ἀνατάξασθαι διήγησιν περὶ τῶν πεπληροφορημένων ἐν ἡμῖν πραγμάτων,</p>
        <p><span class="rubric">1:2</span> καθὼς παρέδοσαν ἡμῖν οἱ ἀπ’ ἀρχῆς αὐτόπται καὶ ὑπηρέται γενόμενοι τοῦ λόγου,</p>
      </section>
    </article>
  </main>

  <main class="manuscript-wrapper john ">
    <article class="manuscript-page">
     <div class="manuscript-background"
         >
    </div>
      <header>
        <h1 class="rubric">ΚΑΤΑ ΙΩΑΝΝΗΝ</h1>
      </header>

      <section class="greek-text">
        <p><span class="rubric">1:1</span>Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος.</p>
        <p><span class="rubric">1:2</span>οὗτος ἦν ἐν ἀρχῇ πρὸς τὸν θεόν.</p>
      </section>
    </article>
  </main>
</div>
</div>

<style>
@reference "tailwindcss";
:global(:root) {
    --bg-app: #DCCFB0; 
    /* A deeper, more "toothy" parchment color */
    --bg-page: #E6D5B8; 
    --text-ink: #1B1811;
    /*--text-ink: 2C2416;*/
    --text-rubric: #5f0101;
    --grain-opacity: 0.6; /* High visibility */
     --filter-contrast:100%;
     --filter-brightness:160%;
     --blend-mode:overlay;
     --bgInset: inset 0 0 120px rgba(0,0,0,0.3);
    /*--grainTexture: url('https://www.transparenttextures.com/patterns/black-linen.png');*/
     --filter-saturate:70%;
     --mask-right: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 1000' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 L0 1000 L85 990 C 80 950, 100 920, 90 880 C 95 840, 75 810, 85 770 C 80 730, 100 700, 90 660 C 95 620, 75 590, 85 550 C 80 510, 100 480, 90 440 C 95 400, 75 370, 85 330 C 80 290, 100 260, 90 220 C 95 180, 75 150, 85 110 C 80 70, 100 40, 90 0 Z' fill='black'/%3E%3C/svg%3E");
    --mask-left: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 1000' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100 0 L100 1000 L15 990 C 20 950, 0 920, 10 880 C 5 840, 25 810, 15 770 C 20 730, 0 700, 10 660 C 5 620, 25 590, 15 550 C 20 510, 0 480, 10 440 C 5 400, 25 370, 15 330 C 20 290, 0 260, 10 220 C 5 180, 25 150, 15 110 C 20 70, 0 40, 10 0 Z' fill='black'/%3E%3C/svg%3E");
    }

  :global([data-theme='dark']) {
    --bg-app: #0A0A08;
    --bg-page: #1A1A17; 
    --text-ink: #E0D7C2;
    --text-rubric: #eb8c8c;
    --grain-opacity: 0.5;
    --filter-contrast:155%;
     --filter-brightness:65%;
     /*--blend-mode:multiply;*/
     /*--bgInset: inset 0 0 120px rgba(255,255,255,1.05);*/
    /*--grainTexture: url('https://www.transparenttextures.com/patterns/white-linen.png');*/
  }

  /* Matthew (Default) */
.matthew {
  --bg-page: #fc886ad5;
  --text-rubric: #4d0000;
}
:global([data-theme='dark'] .matthew){

    --text-rubric: #f7a889;
    /*
    --bg-page: #1A1A17; 
    --grain-opacity: 0.5;

    --filter-contrast:60%;
    --filter-brightness:190%;
    --blend-mode:overlay;
    /*
     --filter-brightness:80%;
     --blend-mode:color-burn;
     --filter-saturate:70%;*/

}



/* Mark - Creamier paper with Green Rubrics */
.mark {
    --bg-page: #5fd85a;
    --filter-saturate: 80%;
    --filter-contrast:60%;
    --filter-brightness:150%;  
    --text-rubric: #033803; 
    --blend-mode:overlay;
    
  
}

:global([data-theme='dark'] .mark){
    --text-rubric: #a8df6a;
    --grain-opacity:0.3;
    --filter-contrast:100%;
    --filter-brightntess: 100%;

      --filter-saturate: 70%;
    --filter-contrast:150%;
    --filter-brightness:70%;  
   /*
    --grain-opacity:0.2;
     --filter-contrast:140%;
     --filter-brightness:40%;
     --blend-mode:color-burn;
     --filter-saturate:70%;*/

}


/* Mark - Creamier paper with Green Rubrics */
.luke {
    --bg-page: #5ab0d8;
    --text-rubric: #061d5c;
    /*--filter-saturate: 80%;
    --filter-contrast:60%;
    --filter-brightness:150%;  
    --text-rubric: #033803; 
    --blend-mode:overlay;*/
    
  
}

:global([data-theme='dark'] .luke){

    --text-rubric: #879ddb;
    --filter-contrast:190%;
    --filter-brightness:50%;
    /*
    --grain-opacity:0.2;
     --filter-contrast:140%;
     --filter-brightness:40%;
     --blend-mode:color-burn;
     --filter-saturate:70%;*/

}



/* John - Ashier tone with Indigo Rubrics */
.john {
  --bg-page: #c36fd8c2;
  --text-rubric: #240252;
}

:global([data-theme='dark'] .john){

    --text-rubric: #b081e6;
    --filter-contrast:190%;
    --filter-brightness:50%;
    /*
    --grain-opacity:0.2;
     --filter-contrast:140%;
     --filter-brightness:40%;
     --blend-mode:color-burn;
     --filter-saturate:70%;*/

}

/* Miscellaneous - Darker, more aged feel */
.misc {
  --bg-page: #CDBE9A;
  --text-rubric: #3E2723;
}
  /*.mark {
    --text-rubric: #007A00;
    --bg-app: #DCCFB0; 
   
    --bg-page: #E6D5B8; 
  }*/
  .app-container {
    min-height: 100vh;
    background-color: var(--bg-app);
    padding: 2rem;
    font-family: 'SBL BibLit', 'Gentium Plus', 'Times New Roman', serif;
    transition: background-color 0.4s ease;
  }

  .manuscript-background{
    position: absolute;
    inset: 0;
    pointer-events:none;
    opacity: var(--grain-opacity);
    background: 
      /*linear-gradient(rgba(0,0,0, var(--grain-opacity)), rgba(0,0,0, var(--grain-opacity))),*/
      var(--grainTexture),
      var(--bg-page);
    box-shadow: var(--bgInset);
    background-blend-mode:  destination-over, var(--blend-mode);
    
    /* This forces the browser to render the grain with higher "bite" */
    filter: contrast(var(--filter-contrast)) brightness(var(--filter-brightness)) saturate(var(--filter-saturate));
  }


  .manuscript-page {
    max-width: 850px;
    margin: 0 auto;
    padding: 1rem;
    margin: 0.1rem;
    position: relative;
    /* Base opaque backing so the wrapper's drop-shadow doesn't bleed through the semi-transparent texture */
    background-color: var(--bg-app);
    
    /* DUAL LAYER ENGINE */
    /* Layer 1: The PNG Texture */
    /* Layer 2: A subtle radial gradient to mimic aged center */
    /* Layer 3: The solid parchment color */
   
    
    color: var(--text-ink);
    transition: all 0.4s ease;

    

   mask-image: 
        var(--mask-left),           /* Your original Left */
        linear-gradient(black, black), /* The Center */
        var(--mask-right);          /* The Inverted Right */

    /* The 'Secret Sauce' for alignment: */
    mask-size: 40px 100%, calc(100% - 80px) 100%, 40px 100%;
    mask-position: left, center, right;
    mask-repeat: no-repeat;
   
  
    mask-image: var(--mask-left), linear-gradient(black, black), var(--mask-right);
    /* Flip the right-side mask so the wave faces inward */
    -webkit-mask-box-image: none;
  }

  

/* Separate the text so the background filter doesn't blur it */
  .greek-text, .rubric {
    position: relative;
    z-index: 10;
    /* Reset the parent's contrast/brightness for the text specifically */
    filter: contrast(100%) brightness(100%);
  }
.rubric {
    color: var(--text-rubric);
    font-weight: bold;
    text-align: center;
  }

  @media (min-width: 1024px) {
    .greek-text{
      line-height: 2.1;
    }
  }
  .greek-text {
    font-size: 1.6rem;
    @apply lg:leading-loose sm:leading-relaxed;
    
    text-align: justify;
    /* Helps with legibility on heavy textures */
    text-shadow: 0.5px 0.5px 0px rgba(255,255,255,0.05);
  }

  h1.rubric {
    font-size: 2.8rem;
    margin-bottom: 3rem;
  }



  .toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1.5rem;
  }

  .theme-toggle {
    cursor: pointer;
    padding: 10px 20px;
    background: var(--bg-page);
    color: var(--text-ink);
    border: 1px solid var(--text-rubric);
    font-weight: bold;
    border-radius: 4px;
    transition: background 0.3s;
  }

  .manuscript-wrapper{
    @apply lg:flex-1 sm:w-full  md:w-1/2;
    /* Apply drop-shadow to the wrapper so the mask doesn't clip it */
    filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.5));
  }

  :global([data-theme='dark'] .manuscript-wrapper){
    
    /* Apply drop-shadow to the wrapper so the mask doesn't clip it */
    filter: drop-shadow(0 5px 10px rgba(100, 100, 100, 0.2));
  }
</style>