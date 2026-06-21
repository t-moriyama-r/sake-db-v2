import { boardModels } from './board';
import { flavorVoteModels } from './flavorVote';
import { liquorModels } from './liquor';
import { liquorHistoryModels } from './liquorHistory';
import { tagModels } from './tag';

export const liquorSchema = {
  ...liquorModels,
  ...liquorHistoryModels,
  ...boardModels,
  ...tagModels,
  ...flavorVoteModels,
};
