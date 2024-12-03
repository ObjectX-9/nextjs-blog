export interface TimelineLink {
  text: string;
  url: string;
}

export interface TimelineEvent {
  year: number;
  month: number;
  title: string;
  location?: string;
  description: string;
  tweetUrl?: string;
  imageUrl?: string;
  links?: TimelineLink[];
}

export const timelineEvents: TimelineEvent[] = [
  {
    "year": 2024,
    "month": 1,
    "title": "Bought a house in the Netherlands",
    "location": "Netherlands",
    "description": "Life's full of surprises! Just a few days after I posted the tweet below, my real estate agent called me. Turns out, the winning bidder unexpectedly backed out, so my offer was still good. I ended up buying a house in the Netherlands.",
    "tweetUrl": "https://x.com/elonmusk/status/1863122664455614909",
    "imageUrl": "/avatar.png"
  },
  {
    "year": 2022,
    "month": 12,
    "title": "Completed the \"Alpha\" phase",
    "description": "Lost about 5 kgs. Now it's time for the \"Beta\" phase."
  },
  {
    "year": 2022,
    "month": 9,
    "title": "Started on Focus T25 workout program",
    "description": "I've gained a lot weight lately which makes me feel completely bad about it. Let's see what happens after completing the first part \"Alpha\"."
  },
  {
    "year": 2022,
    "month": 6,
    "title": "Minted some TinyFaces NFT",
    "description": "Check out my collection",
    "links": [
      {
        "text": "here",
        "url": "https://example.com/collection"
      }
    ]
  },
  {
    "year": 2022,
    "month": 3,
    "title": "Bought my first NFT",
    "description": "I've finally joined this realm with buying an NFT from Zorb",
    "links": [
      {
        "text": "Zorb",
        "url": "https://example.com/zorb"
      }
    ]
  }
];
