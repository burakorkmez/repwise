// Pure access rules, shared by pages (what to show) and server actions (what to allow)

// The first lesson is the free preview; owners and buyers see everything
export const canWatchLesson = ({ isPreview, isOwner, hasPurchase }: { isPreview: boolean; isOwner: boolean; hasPurchase: boolean }) =>
  isPreview || isOwner || hasPurchase

// Any paid purchase from a trainer earns one (editable) review; nobody reviews themselves
export const canReview = ({ isSelf, hasPurchase }: { isSelf: boolean; hasPurchase: boolean }) => !isSelf && hasPurchase
