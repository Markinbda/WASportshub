export type SportCategory = 'primary' | 'secondary' | 'private'

export type Sport = {
  name: string
  slug: string
  category: SportCategory
  description: string
  icon: string
  accent: string
  record?: string
  teams?: string[]
}

export const sports: Sport[] = [
  { name: 'Badminton', slug: 'badminton', category: 'primary', description: 'Fast-paced competition built on precision, movement and composure.', icon: '🏸', accent: '#e3a72f', record: '8–2', teams: ['U13', 'U15', 'Varsity'] },
  { name: 'Basketball', slug: 'basketball', category: 'primary', description: 'Warwick Bears basketball from junior development to varsity play.', icon: '🏀', accent: '#e36d32', record: '12–3', teams: ['U11', 'U13', 'Varsity'] },
  { name: 'Cricket', slug: 'cricket', category: 'primary', description: 'A proud school tradition, developing skill, patience and teamwork.', icon: '🏏', accent: '#8cbf3f', record: '6–2–1', teams: ['U11', 'U14', 'Senior'] },
  { name: 'Cross Country', slug: 'cross-country', category: 'primary', description: 'Endurance, resilience and team racing across Bermuda’s courses.', icon: '🏃', accent: '#d9a528', record: '2nd Island Schools', teams: ['Primary', 'Middle', 'Senior'] },
  { name: 'Football', slug: 'football', category: 'primary', description: 'Technical, ambitious football for every competitive age group.', icon: '⚽', accent: '#1f8f58', record: '10–2–2', teams: ['U9', 'U11', 'U13', 'U15', 'Varsity', 'High Performance'] },
  { name: 'Netball', slug: 'netball', category: 'primary', description: 'Smart movement, sharp passing and competitive team play.', icon: '◉', accent: '#db4e77', record: '9–3', teams: ['U11', 'U13', 'Varsity'] },
  { name: 'Rugby', slug: 'rugby', category: 'primary', description: 'Confident, disciplined rugby grounded in courage and respect.', icon: '🏉', accent: '#9c6a38', record: '7–4', teams: ['U11', 'U13', 'U16'] },
  { name: 'Swimming', slug: 'swimming', category: 'primary', description: 'Six lanes of development, competition and high performance.', icon: '🏊', accent: '#2589a8', record: '18 school records', teams: ['Development', 'Competitive', 'High Performance'] },
  { name: 'Track & Field', slug: 'track-and-field', category: 'primary', description: 'Running, jumping and throwing toward personal bests.', icon: '⚡', accent: '#d1483f', record: '14 podiums', teams: ['Primary', 'Middle', 'Senior'] },
  { name: 'Volleyball', slug: 'volleyball', category: 'primary', description: 'Energetic indoor competition built around communication.', icon: '🏐', accent: '#3977b8', record: '11–4', teams: ['U13', 'Junior Varsity', 'Varsity'] },
  ...['Archery', 'Bowling', 'Boxing', 'Field Hockey', 'Indoor Football', 'Kayaking', 'Mountain Biking', 'Pickleball', 'Sailing', 'Softball', 'Squash', 'Table Tennis', 'Tennis', 'Walking', 'Weights', 'Yoga'].map((name, index) => ({ name, slug: name.toLowerCase().replaceAll(' & ', '-and-').replaceAll(' ', '-'), category: 'secondary' as const, description: 'A welcoming activity programme for Warwick Academy students.', icon: ['◎', '●', '◇', '◆'][index % 4], accent: '#4f6b59' })),
  ...['Equestrian', 'Dance', 'Fitness'].map((name) => ({ name, slug: name.toLowerCase(), category: 'private' as const, description: 'Private-session programme information and enquiries.', icon: '○', accent: '#956d3f' })),
]

export const fixtures = [
  { day: '08', month: 'SEP', time: '4:00 PM', team: 'U15 Football', opponent: 'Saltus Grammar School', venue: 'Lower Field', sport: 'Football' },
  { day: '09', month: 'SEP', time: '3:45 PM', team: 'Varsity Netball', opponent: 'BHS', venue: 'Outdoor Netball Court', sport: 'Netball' },
  { day: '10', month: 'SEP', time: '4:15 PM', team: 'U13 Basketball', opponent: 'Somersfield Academy', venue: 'Nancy A. Smith Sports Hall', sport: 'Basketball' },
  { day: '12', month: 'SEP', time: '9:00 AM', team: 'Competitive Swim', opponent: 'Island Schools Meet', venue: '25m Swimming Pool', sport: 'Swimming' },
]

export const gallery = [
  { title: 'Pre-season under the lights', sport: 'Football', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=85' },
  { title: 'Pool session', sport: 'Swimming', image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1000&q=85' },
  { title: 'Varsity at home', sport: 'Basketball', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1000&q=85' },
  { title: 'Track squad training', sport: 'Track & Field', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1000&q=85' },
]

export const news = [
  { sport: 'Swimming', date: 'September 4', title: 'Bears return to the pool with purpose', summary: 'The competitive squad opened the new season with benchmark time trials and six personal bests.' },
  { sport: 'Football', date: 'September 2', title: 'High-performance programme begins', summary: 'Selected athletes started a focused block of technical sessions ahead of the autumn schedule.' },
  { sport: 'Volleyball', date: 'August 29', title: 'Varsity welcomes a new season', summary: 'A balanced roster brings experience, energy and plenty of ambition to the Sports Hall.' },
]

export const roster = [
  { name: 'Amelia B.', role: 'Captain · Midfield', number: '8' },
  { name: 'Chloe D.', role: 'Forward', number: '11' },
  { name: 'Ethan F.', role: 'Goalkeeper', number: '1' },
  { name: 'Jonah H.', role: 'Defence', number: '4' },
  { name: 'Maya L.', role: 'Midfield', number: '6' },
  { name: 'Noah S.', role: 'Forward', number: '9' },
]