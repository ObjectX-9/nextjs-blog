export interface Friend {
  avatar: string;
  name: string;
  title: string;
  description: string;
  link: string;
  position?: string;
  location?: string;
}

export const friends: Friend[] = [
  {
    "avatar": "https://avatars.githubusercontent.com/u/6128107",
    "name": "Evan You",
    "title": "Creator of Vue.js & Vite",
    "description": "Creator of Vue.js",
    "link": "https://github.com/yyx990803",
    "position": "Creator & Project Lead",
    "location": "Singapore"
  },
  {
    "avatar": "https://avatars.githubusercontent.com/u/499550",
    "name": "Dan Abramov",
    "title": "Co-creator of Redux & Create React App",
    "description": "Co-creator of Redux and Create React App",
    "link": "https://github.com/gaearon",
    "position": "Software Engineer",
    "location": "London, UK"
  },
  {
    "avatar": "https://avatars.githubusercontent.com/u/810438",
    "name": "Sebastian McKenzie",
    "title": "Creator of Babel & Rome",
    "description": "Creator of Babel",
    "link": "https://github.com/sebmck"
  },
  {
    "avatar": "https://avatars.githubusercontent.com/u/170270",
    "name": "Sindre Sorhus",
    "title": "Open Source Developer",
    "description": "Creator of many open source projects",
    "link": "https://github.com/sindresorhus"
  },
  {
    "avatar": "https://avatars.githubusercontent.com/u/1426799",
    "name": "Kent C. Dodds",
    "title": "Creator of Testing Library",
    "description": "Educator and Open Source Developer",
    "link": "https://github.com/kentcdodds"
  },
  {
    "avatar": "https://avatars.githubusercontent.com/u/263385",
    "name": "Sebastian Markbåge",
    "title": "React Core Team Member",
    "description": "React Core Team Member",
    "link": "https://github.com/sebmarkbage"
  }
];
