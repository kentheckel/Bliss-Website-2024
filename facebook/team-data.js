// Shared teammate data for the group page and per-person profile renderer.
window.ASFC_TEAM = {
	kent: {
		name: "Kent Heckel",
		pronouns: "He/Him",
		role: "Founder &amp; CEO",
		department: "Leadership",
		intro: [
			{ icon: "fas fa-shopping-bag", label: "Founder &amp; CEO at: Antisocial Friends Club" },
			{ icon: "fas fa-home", label: "Lives in: Cleveland, Ohio" },
			{ icon: "fas fa-heart", label: "Married" },
			{ icon: "fas fa-map-marker-alt", label: "From: Annapolis, Maryland" },
			{ icon: "fas fa-envelope", label: "kent@kentheckel.com" }
		],
		photo: "images/team/kent.jpg",
		cover: "images/cover-images/cover1.jpg",
		posts: [
			{
				date: "15 January 2025",
				text: "Hey! I'm Kent, a Content Strategist and Digital Media Innovator with proven expertise in YouTube Growth and Revenue Generation. 10+ years driving over 1 billion organic views, millions in content revenue & millions in brand deal revenue.",
				img: "images/post/Kent3 Copy.JPG"
			},
			{
				date: "16 November 2024",
				text: "Isla got a camera for her Birthday!",
				img: "images/post/image2.jpg"
			},
			{
				date: "5 Sep 2024",
				text: "Spotter Studio &amp; I made an ad together! They were looping it in the lobby of Vidsummit",
				img: "images/post/image3.jpeg"
			},
			{
				date: "22 Apr 2022",
				text: "Attended YouTube's Creator Collective in Idaho!",
				img: "images/post/image4.jpg"
			},
			{
				date: "07 May 2019",
				text: "Found Bliss!",
				img: "images/post/7.jpg"
			},
			{
				date: "30 Nov 2021",
				text: "My First YouTube video to hit 10 Million views!",
				embed: '<iframe width="100%" height="315" src="https://www.youtube.com/embed/mD9-ckm4xEU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
			}
		]
	},

	jordyn: {
		name: "Jordyn Brooks",
		pronouns: "She/Her",
		role: "Director of Operations",
		department: "Operations",
		intro: [
			{ icon: "fas fa-shopping-bag", label: "Director of Operations at: Antisocial Friends Club" },
			{ icon: "fas fa-tasks", label: "Runs: SOPs, onboarding, &amp; the entire ops machine" },
			{ icon: "fas fa-envelope", label: "jordyn@antisocialfriendsclub.com" },
			{ icon: "fas fa-briefcase", label: "Status: Full Time" }
		],
		photo: "images/team/jordyn.jpg",
		posts: [
			{ date: "14 March 2025", text: "New SOPs are live in Notion. Onboarding checklist now under 20 minutes 🎉 If you spot anything weird in the templates, ping me directly." },
			{ date: "2 February 2025", text: "Q1 ops audit: every recurring task now has an owner, a doc, and a deadline. The era of \"I'll do it later\" is OVER 🫡" },
			{ date: "20 January 2025", text: "Templated the entire creator-onboarding flow. New clients now go from contract signed → kicked off in 48 hours." }
		]
	},

	levi: {
		name: "Levi Rassmussen",
		pronouns: "He/Him",
		role: "Lead Strategist",
		department: "Strategy",
		intro: [
			{ icon: "fas fa-shopping-bag", label: "Lead Strategist at: Antisocial Friends Club" },
			{ icon: "fas fa-chart-line", label: "Obsessed with: CTR, retention, &amp; packaging" },
			{ icon: "fas fa-envelope", label: "levi@antisocialfriendsclub.com" },
			{ icon: "fas fa-briefcase", label: "Status: Full Time" }
		],
		photo: "images/team/levi.jpg",
		posts: [
			{ date: "2 April 2025", text: "Channel we packaged last month just crossed 1M views on a single upload. Title + thumb A/B test won by 38% CTR over the control. Strategy works, kids 📈" },
			{ date: "18 March 2025", text: "Hot take: most creators don't have a content problem, they have a packaging problem. Same idea, better title + thumb = different universe." },
			{ date: "5 February 2025", text: "Spent the morning reverse-engineering MrBeast titles. The pattern isn't \"big number,\" it's \"specific stakes.\" Worth the rabbit hole." }
		]
	},

	brendan: {
		name: "Brendan Cole",
		pronouns: "He/Him",
		role: "Lead Strategist",
		department: "Strategy",
		intro: [
			{ icon: "fas fa-shopping-bag", label: "Lead Strategist at: Antisocial Friends Club" },
			{ icon: "fas fa-bullseye", label: "Focus: retention, rewatch, &amp; hook design" },
			{ icon: "fas fa-envelope", label: "brendan@antisocialfriendsclub.com" },
			{ icon: "fas fa-briefcase", label: "Status: Contractor" }
		],
		photo: "images/team/brendan.jpg",
		posts: [
			{ date: "11 April 2025", text: "Stop optimizing for the algorithm, start optimizing for the rewatch. If your retention graph dips at second 3, the algo never even gets a vote." },
			{ date: "30 March 2025", text: "Looked at 50 top-performing videos in our portfolio - 47 of them open with a question. Hooks > intros, always." },
			{ date: "12 February 2025", text: "Strategy doc shipped for a new sports channel. First three videos all hit above-average CTR. We're cooking 🔥" }
		]
	},

	brelan: {
		name: "Brelan Butler",
		pronouns: "He/Him",
		role: "Vertical Specialist",
		department: "Creative",
		intro: [
			{ icon: "fas fa-shopping-bag", label: "Vertical Specialist at: Antisocial Friends Club" },
			{ icon: "fas fa-mobile-alt", label: "Lives in: Vertical 9:16" },
			{ icon: "fas fa-envelope", label: "brelan@antisocialfriendsclub.com" },
			{ icon: "fas fa-briefcase", label: "Status: Contractor" }
		],
		photo: "images/team/brelan.jpg",
		posts: [
			{ date: "22 April 2025", text: "Shorts experiment of the week: vertical re-edits with on-screen captions ran 3.2x watch time vs. uncaptioned. Captions are not optional in 2025." },
			{ date: "8 April 2025", text: "Re-cut a long-form into 6 verticals. Combined they pulled more views than the original. Repurposing is undefeated." },
			{ date: "2 March 2025", text: "If the first frame is boring, nothing else matters. Hook the eye in &lt;1 second or get scrolled past." }
		]
	},

	spencer: {
		name: "Spencer Lowder",
		pronouns: "He/Him",
		role: "Thumbnail Designer",
		department: "Creative",
		intro: [
			{ icon: "fas fa-shopping-bag", label: "Thumbnail Designer at: Antisocial Friends Club" },
			{ icon: "fas fa-paint-brush", label: "Tools: Photoshop, Figma, &amp; vibes" },
			{ icon: "fas fa-envelope", label: "spencerlowder@gmail.com" },
			{ icon: "fas fa-briefcase", label: "Status: Contractor" }
		],
		photo: "images/team/spencer.jpg",
		posts: [
			{ date: "18 April 2025", text: "Shipped 14 thumbs this week. Reminder: contrast &gt; clever. If it doesn't read at 200px on a phone in sunlight, it doesn't exist." },
			{ date: "1 April 2025", text: "Three faces max. Past three, the eye doesn't know where to land. Designed enough thumbs to die on this hill 🪦" },
			{ date: "10 March 2025", text: "New thumbnail framework: ONE focal point, TWO supporting elements, THREE color values. Boring rules make winning thumbs." }
		]
	},

	jake: {
		name: "Jake Groulx",
		pronouns: "He/Him",
		role: "Vertical Specialist",
		department: "Creative",
		intro: [
			{ icon: "fas fa-shopping-bag", label: "Vertical Specialist at: Antisocial Friends Club" },
			{ icon: "fas fa-film", label: "Specialty: Shorts, Reels, TikToks" },
			{ icon: "fas fa-envelope", label: "jake@antisocialfriendsclub.com" },
			{ icon: "fas fa-briefcase", label: "Status: Contractor" }
		],
		photo: "images/team/jake.jpg",
		posts: [
			{ date: "28 April 2025", text: "Big win: a single vertical clip pulled 12M views overnight 🍿 Receipts in the analytics doc. The hook was 1.4 seconds." },
			{ date: "15 April 2025", text: "Editing reminder: cut on the WORD, not the breath. Feels snappier, retention loves it." },
			{ date: "3 March 2025", text: "Shorts strategy: post 3x/day for 30 days. Then look at retention curves, not view counts. View counts lie, retention doesn't." }
		]
	},

	david: {
		name: "David Martin",
		pronouns: "He/Him",
		role: "Vertical Specialist",
		department: "Creative",
		intro: [
			{ icon: "fas fa-shopping-bag", label: "Vertical Specialist at: Antisocial Friends Club" },
			{ icon: "fas fa-cut", label: "Crushed It Editor &amp; collaborator" },
			{ icon: "fas fa-envelope", label: "david@crushedit.com" },
			{ icon: "fas fa-briefcase", label: "Status: Contractor" }
		],
		photo: "images/team/david.svg",
		posts: [
			{ date: "5 May 2025", text: "Crushed It tip of the week: don't over-cut. Let the reaction breathe. Two extra frames of silence beats one extra zoom-bump." },
			{ date: "20 April 2025", text: "If you're editing reaction content and you're afraid of pauses, you're going to bury the moment that mattered." },
			{ date: "1 April 2025", text: "Color grading short-form is underrated. 10 seconds in DaVinci can take a phone clip from mid to cinematic." }
		]
	},

	casey: {
		name: "Casey Diehl",
		pronouns: "He/Him",
		role: "Sales",
		department: "Sales",
		intro: [
			{ icon: "fas fa-shopping-bag", label: "Sales at: Antisocial Friends Club" },
			{ icon: "fas fa-handshake", label: "Closes: creator deals &amp; partnerships" },
			{ icon: "fas fa-envelope", label: "casey@antisocialfriendsclub.com" },
			{ icon: "fas fa-briefcase", label: "Status: Active" }
		],
		photo: "images/team/casey.jpg",
		posts: [
			{ date: "9 May 2025", text: "Closed two new creator deals this week 💼 Pipeline is looking 🔥 for Q3. If anyone has warm intros to mid-size sports channels, slide into my DMs." },
			{ date: "22 April 2025", text: "The best sales pitch is a screenshot of someone else's analytics dashboard. Receipts &gt; promises." },
			{ date: "3 April 2025", text: "If a creator asks \"can you guarantee growth,\" the answer is no. If they ask \"can you guarantee process,\" the answer is yes. That's the deal." }
		]
	}
};
