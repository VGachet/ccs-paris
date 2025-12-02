// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { resendAdapter } from '@payloadcms/email-resend'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Services } from './collections/Services'
import { Blog } from './collections/Blog'
import { Bookings } from './collections/Bookings'
import { Features } from './collections/Features'
import { LegalPages } from './collections/LegalPages'
import { Testimonials } from './collections/Testimonials'
import { SiteSettings } from './collections/SiteSettings'
import { Promotions } from './collections/Promotions'
import { TimeSlots } from './collections/TimeSlots'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages, Services, Blog, Bookings, Features, Testimonials, LegalPages, Promotions, TimeSlots],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  localization: {
    locales: [
      {
        code: 'fr',
        label: 'Français',
      },
      {
        code: 'en',
        label: 'English',
      },
    ],
    defaultLocale: 'fr',
    fallback: true,
  },
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
  email: resendAdapter({
    defaultFromAddress: 'contact@ccs-paris.fr',
    defaultFromName: 'CCS Paris',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
})
