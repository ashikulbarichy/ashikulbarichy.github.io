import {heroType} from './hero'
import {menuType} from './menu'
import {projectType} from './project'
import {aboutSlideType} from './aboutSlide'
import {siteSettingsType} from './siteSettings'
import {identityType} from './identity'
import {faqType} from './faq'
import {uiTextType} from './uiText'
import {seoType} from './seo'

export const schemaTypes = [
  // Object types must come before the documents that reference them by name.
  seoType,

  // Singletons
  identityType,
  siteSettingsType,
  uiTextType,

  // Content
  faqType,
  projectType,
  heroType,
  menuType,
  aboutSlideType,
]
