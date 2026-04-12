import { liquorModels } from './liquor';
import { liquorHistoryModels } from './liquorHistory';
import { boardModels } from './board';
import { tagModels } from './tag';
import { flavorVoteModels } from './flavorVote';
import { flavorMapModels } from './flavorMap';

export const liquorSchema = {
  ...liquorModels,
  ...liquorHistoryModels,
  ...boardModels,
  ...tagModels,
  ...flavorVoteModels,
  ...flavorMapModels,
};
