import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/** App-wide navigation ref, attached to the root NavigationContainer. Lets code
 *  that lives OUTSIDE the navigator tree (e.g. the global HintCard overlay in
 *  HintProvider) drive navigation. */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** Deep-link to an encyclopedia article from anywhere. No-op until navigation
 *  is ready. Species-safety of the target is the caller's responsibility. */
export function navigateToArticle(articleId: string): void {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate('Main', {
    screen: 'EncyclopediaTab',
    params: { screen: 'ArticleDetail', params: { articleId } },
  });
}
