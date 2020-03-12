import { Query } from '@/types/query'

export class SqlService {
  getQuery (sql: string): Query {
    return Query.parse(sql)
  }
  runQuery (sql: string, tables: any): any[] {
    return this.getQuery(sql).run(tables)
  }
}
