import { UserDetailPage } from "../components/UserDetailPage";

// The Profile tab when viewing your own profile. UserDetailPage already
// adapts its chrome (hides the back button, shows the bell, splits the
// Lists tab into "Your lists" + "Bookmarked") when viewer.id === user.id,
// so this screen is intentionally a thin pass-through. It exists so that
// "go to the My Profile tab" is one component import in BookingsScreen
// instead of UserDetailPage configured five different ways inline.
export function MyProfileScreen({
  user,
  bookmarkedListIds,
  onToggleListBookmark,
  onOpenRestaurant,
  onOpenList,
  onOpenNotifications,
  hasNotifications,
}) {
  return (
    <UserDetailPage
      user={user}
      viewer={user}
      bookmarkedListIds={bookmarkedListIds}
      onToggleListBookmark={onToggleListBookmark}
      onOpenRestaurant={onOpenRestaurant}
      onOpenList={onOpenList}
      onOpenNotifications={onOpenNotifications}
      hasNotifications={hasNotifications}
    />
  );
}
