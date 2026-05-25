// Max number of dining companions per booking (accepted + pending combined).
// The host is not counted in this total.
export const MAX_CREW = 3

// How long each recommendation message stays in the DealCardLarge tooltip
// before rotating to the next recommender. Single-recommender deals don't
// rotate.
export const RECOMMENDATION_ROTATE_MS = 4500

// Max number of phone-number ("outsider") gifts a user can send. Friends-in-app
// gifts don't count against this — it caps only the SMS-link variant. The
// PhoneEntry + MessageSheet sheets surface the remaining quota; PhoneEntry's
// Continue button is disabled once the user reaches zero.
export const OUTSIDER_GIFT_LIMIT = 3
