"use strict";

(() => {
    const stories = window.ASFC_STRATEGY_STORIES;
    const channel = new URLSearchParams(location.search).get('channel');
    const story = Object.hasOwn(stories, channel) ? stories[channel] : null;
    const root = document.getElementById('strategy');
    const escape = value => String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);

    if (!story) {
        document.title = 'Client strategies — ASFC';
        root.innerHTML = `<p class="eyebrow">ANTISOCIAL FRIENDS CLUB</p><h1>Find the strategy behind the channel.</h1><nav class="story-index" aria-label="Client strategies">${Object.entries(stories).map(([key, item]) => `<a href="?channel=${encodeURIComponent(key)}">${escape(item.name)} <span aria-hidden="true">↗</span></a>`).join('')}</nav>`;
        return;
    }

    document.title = `${story.name} — The ASFC strategy`;
    root.innerHTML = `
        <header class="client-header">
            <img src="${escape(story.image)}" width="40" height="40" alt="">
            <div><p class="eyebrow">ANTISOCIAL FRIENDS CLUB</p><p class="client-name">${escape(story.name)}</p></div>
        </header>
        <p class="category">${escape(story.category)}</p>
        <h1>${escape(story.headline)}</h1>
        <p class="context">${escape(story.context)}</p>
        <section class="strategic-shift" aria-labelledby="shift-heading">
            <h2 id="shift-heading">Our strategic shift</h2>
            <p>${escape(story.shift)}</p>
        </section>
        <ol class="strategy-flow" aria-label="The strategy at a glance">${story.flow.map((step, i) => `<li><span class="step-number">0${i + 1}</span><span>${escape(step)}</span></li>`).join('')}</ol>
        <section class="execution" aria-labelledby="execution-heading">
            <h2 id="execution-heading">How we made it work</h2>
            <ol>${story.moves.map(([heading, copy]) => `<li><h3>${escape(heading)}</h3><p>${escape(copy)}</p></li>`).join('')}</ol>
        </section>
        <section class="result" aria-label="A result of the work">
            <strong>${escape(story.result)}</strong>
            <div><p>${escape(story.resultLabel)}</p><small>${escape(story.period)}</small></div>
        </section>
        <p class="our-role"><span>Our work</span>${escape(story.role)}</p>
        <details class="more-context">
            <summary>A closer look</summary>
            <p>${escape(story.detail)}</p>
            ${story.proof ? `<figure><a href="${escape(story.proof.src)}" target="_blank" rel="noopener" aria-label="Open the full-size thumbnail example"><img src="${escape(story.proof.src)}" alt="${escape(story.proof.alt)}" loading="lazy"></a><figcaption>${escape(story.proof.caption)}</figcaption></figure>` : ''}
        </details>
        <footer>
            <p>Let’s find your next move.</p>
            <a href="mailto:jordyn@antisocialfriendsclub.com?subject=${encodeURIComponent(`ASFC strategy — inspired by ${story.name}`)}">Talk strategy <span aria-hidden="true">↗</span></a>
        </footer>`;
})();
