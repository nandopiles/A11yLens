/** Repository: mock content for the social feed demo. */

export interface FeedPost {
  id: string;
  author: string;
  handle: string;
  /** Deliberately dense body text with no heading structure. */
  body: string;
  /** Background color for the "photo" block behind the caption. */
  photoColor: string;
  caption: string;
}

export const feedPosts: FeedPost[] = [
  {
    id: 'p1',
    author: 'Nordic Trails',
    handle: '@nordictrails',
    body:
      'Just back from three weeks on the fjords and honestly the light up there does something to your sense of time you stop checking the phone you stop counting hours you just walk and the trail keeps unfolding and every ridge looks like the last one until suddenly it does not and the whole valley opens beneath you all at once.',
    photoColor: '#3b6ea5',
    caption: 'Sunrise over the northern ridge',
  },
  {
    id: 'p2',
    author: 'Studio Kai',
    handle: '@studiokai',
    body:
      'New drop this Friday we spent months on the details the stitching the weight of the paper the way the ink sits and we cannot wait for you to hold it in your hands there is nothing like a physical object in a world of screens and we mean that with our whole chest so mark the date and tell a friend.',
    photoColor: '#b06a3b',
    caption: 'Behind the scenes at the studio',
  },
  {
    id: 'p3',
    author: 'City Eats',
    handle: '@cityeats',
    body:
      'The best meal is the one you did not plan the little place with no sign the owner who insists you try the special the table wobbling on the cobblestones the plate arriving before you finish asking what it is and then that first bite that reorganizes your afternoon around it entirely.',
    photoColor: '#4a7c59',
    caption: 'Todays special, plated',
  },
];

export const liveBadgeLabel = 'LIVE';
