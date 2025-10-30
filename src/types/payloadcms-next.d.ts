declare module '@payloadcms/next/views' {
  import { ReactNode } from 'react'

  export function NotFoundPage(props: {
    config: any
    params: Promise<{ segments: string[] }>
    searchParams: Promise<{ [key: string]: string | string[] }>
    importMap: any
  }): ReactNode

  export function RootPage(props: {
    config: any
    params: Promise<{ segments: string[] }>
    searchParams: Promise<{ [key: string]: string | string[] }>
    importMap: any
  }): ReactNode

  export function generatePageMetadata(props: {
    config: any
    params: Promise<{ segments: string[] }>
    searchParams: Promise<{ [key: string]: string | string[] }>
  }): Promise<any>
}

declare module '@payloadcms/next/routes' {
  export function REST_GET(config: any): (req: any) => Promise<any>
  export function REST_POST(config: any): (req: any) => Promise<any>
  export function REST_PUT(config: any): (req: any) => Promise<any>
  export function REST_DELETE(config: any): (req: any) => Promise<any>
  export function REST_PATCH(config: any): (req: any) => Promise<any>
  export function REST_OPTIONS(config: any): (req: any) => Promise<any>
  export function GRAPHQL_PLAYGROUND_GET(config: any): (req: any) => Promise<any>
  export function GRAPHQL_POST(config: any): (req: any) => Promise<any>
}

declare module '@payloadcms/next/layouts' {
  import { ReactNode } from 'react'

  export function handleServerFunctions(args: {
    config: any
    importMap: any
    [key: string]: any
  }): Promise<any>

  export function RootLayout(props: {
    config: any
    importMap: any
    serverFunction: any
    children: ReactNode
  }): ReactNode
}
