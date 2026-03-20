import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { checkAdmin } from './functions/checkAdmin/resource';
import { getAffiliateData } from './functions/getAffiliateData/resource';
import { getFlavorMap } from './functions/getFlavorMap/resource';
import { getVoted } from './functions/getVoted/resource';
import { getRecommendLiquorList } from './functions/getRecommendLiquorList/resource';
import { randomRecommendList } from './functions/randomRecommendList/resource';
import { listFromCategory } from './functions/listFromCategory/resource';
import { searchLiquors } from './functions/searchLiquors/resource';
import { searchLiquorsByTag } from './functions/searchLiquorsByTag/resource';
import { liquorHistories } from './functions/liquorHistories/resource';
import { getUserByIdDetail } from './functions/getUserByIdDetail/resource';
import { getIsBookMarked } from './functions/getIsBookMarked/resource';
import { postFlavor } from './functions/postFlavor/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/
 */
defineBackend({
  auth,
  data,
  storage,
  // ---- Custom Lambda functions ----
  checkAdmin,
  getAffiliateData,
  getFlavorMap,
  getVoted,
  getRecommendLiquorList,
  randomRecommendList,
  listFromCategory,
  searchLiquors,
  searchLiquorsByTag,
  liquorHistories,
  getUserByIdDetail,
  getIsBookMarked,
  postFlavor,
});
