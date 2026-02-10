// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { LayoutProvider } from '@/components/providers'
import { LanguageCode, DirectionEnum, type ApiNavigationNavigationDocument } from '@/lib/generated/types.gen'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'

const mockNavigation = {
  documentId: 'nav-1',
  items: [],
} as unknown as ApiNavigationNavigationDocument

interface CustomRenderOptions extends RenderOptions {
  layoutContext?: {
    lang?: LanguageCode
    direction?: DirectionEnum
    navigation?: ApiNavigationNavigationDocument
  }
}

export const renderWithLayout = (ui: ReactElement, options: CustomRenderOptions = {}) => {
  const {
    layoutContext = {
      lang: LanguageCode.EN,
      direction: DirectionEnum.LTR,
      navigation: mockNavigation,
    },
    ...renderOptions
  } = options

  return render(
    <LayoutProvider
      lang={layoutContext.lang ?? LanguageCode.EN}
      direction={layoutContext.direction ?? DirectionEnum.LTR}
      navigation={layoutContext.navigation ?? mockNavigation}
    >
      {ui}
    </LayoutProvider>,
    renderOptions
  )
}
