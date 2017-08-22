export type Entity = any

export type Empty = boolean | null

export interface Status {
   pendingUpdate: Empty
   id?: string
   success: Empty
   payload: Empty
   busy: false
}

export interface Meta {
}

export interface Resource {
  results: any[]
  entities: {[key: string]: any}
  meta: Meta
  status : {
    fetch: Status
    create: Status
    update: Status
    destroy: Status
  }
}
