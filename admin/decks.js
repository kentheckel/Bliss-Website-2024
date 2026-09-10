export const decks = [
  { title: 'Luka Dončić', description: 'Content menu & creative strategy', type: 'Presentation', href: '/lukadoncic/' },
  { title: 'Lewis Hamilton', description: 'Channel strategy & content opportunities', type: 'Presentation', href: '/lewishamilton/' },
  { title: 'San Antonio Spurs', description: 'How the Spurs became the #1 social team in the NBA', type: 'Case study', href: '/Spurs/ASFC%20Spurs%20Season%20Story%20Deck%20v5%20-%20Presentation%20Mode.html' },
  { title: 'Aspen Snowmass', description: 'Benchmarks, creative direction & three content lanes', type: 'Presentation', href: '/aspensnowmass/' },
  { title: 'Club América', description: 'Audience opportunity & channel strategy', type: 'Presentation', href: '/clubamerica/' },
  { title: 'Luka in Slovenia', description: 'Social performance & post-level reporting', type: 'Report', href: '/lukaslovenia/' },
  { title: 'Paris vs. Slovenia', description: 'Event performance comparison', type: 'Report', href: '/parisvsslovenia/' },
  { title: 'ASFC capabilities', description: 'The agency presentation, including pricing', type: 'Presentation', href: '/pitch/' },
  { title: 'ASFC pitch — PDF', type: 'PDF', href: '/pitch/ASFC-Pitch.pdf' },
  { title: 'ASFC teams — PDF', type: 'PDF', href: '/pitch/exports/ASFC-Pitch-Teams.pdf' },
  { title: 'ASFC athletes — PDF', type: 'PDF', href: '/pitch/exports/ASFC-Pitch-Athletes.pdf' },
  ...['Cam Newton Youtube', 'Iconic Saga Retreat March 2024', 'Iconic Saga Retreat 2023', 'Copy of FF Thumbnail strategy', 'Copy of Vidsummit learnings 2024'].map(title => ({ title, type: 'PowerPoint', href: '/Documents/' + encodeURIComponent(title) + '.pptx' })),
  { title: 'Cam Newton YouTube strategies', type: 'PDF', href: '/Documents/Cam%20Newton%20youtube%20strategies.pdf' }
];
