export enum LogicalOperator {
    DEFAULT = '',
    EQUAL = 'eq',
    NOT_EQUAL = 'neq',
    GREATER_THAN = 'gt',
    GREATER_THAN_EQUAL = 'gte',
    LESS_THAN = 'lt',
    LESS_THAN_EQUAL = 'lte',
    BETWEEN = 'btw',
    NOT_BETWEEN = 'nbtw',
    EMPTY = 'ety',
    NOT_EMPTY = 'nety',
    REGEXP = 'reg',
    NOT_REGEXP = 'nreg'
}
export enum LogicalConnector {
    AND = 'AND',
    OR = 'OR'
}
export abstract class Condition {
    static parse(strConditions: string[]): Condition[] {


        return [];
    }
}
export class SimpleCondition extends Condition{
    constructor(
      public left: string,
      public operator: LogicalOperator,
      public right?: string
    ) {
        super()
    }
}
export class ComposedCondition extends Condition{
    constructor(
        public connector: LogicalConnector,
        public conditions: Condition[]
    ) {
        super()
    }
}
export class Field {
    constructor(
        public table: string,
        public name: string,
        public alias?: string
    ) {}
}
export enum ReservedWords {
    SELECT = 'SELECT',
    FROM = 'FROM',
    WHERE = 'WHERE',
    GROUP = 'GROUP BY'
}
export class Query {
    public fields: Field[] = [];
    public tables: string[] = [];
    public conditions?: Condition[];

    static parse(sql: string): Query {
        const query = new Query()

        sql = sql.replace(/\s+/g, ' ')
                    .replace(/\s+[,]\s+/g, ',')
                    .replace(/\s+[=]\s+/g, '=')
                    .replace(/\s+[>]\s+/g, '>')
                    .replace(/\s+[<]\s+/g, '<')
                    .replace(/\s+[>=]\s+/g, '>=')
                    .replace(/\s+[<=]\s+/g, '<=')
                    .replace(/\s+[<>]\s+/g, '<>')
                    .replace(/\s+[(]\s+/g, '(')
                    .replace(/\s+[)]\s+/g, ')')
                    .trim()

        if (!sql) {
            throw new Error('Invalid query')
        }
        if (!sql.toUpperCase().startsWith(`${ReservedWords.SELECT} `)) {
            throw new Error(`Invalid syntax. Expected ${ReservedWords.SELECT}`)            
        }

        const sqlSplit = sql.split(' ');

        query.fields = sqlSplit[1].split(',').map(strField => {
            const fieldSplit = strField.split('.')
            const fieldSplit2 = fieldSplit[1].split(' as ')

            const table = fieldSplit[0];
            const name = fieldSplit2[0];

            if (fieldSplit2.length > 1) {
                return new Field(table, name, fieldSplit2[1]);
            }
            return new Field(table, name);
        });
        query.tables = sqlSplit[3].split(',');

        const strConditions = sqlSplit.slice(5);

        return query
    }

    run(tables: any): any[] {
        const result:any[] = [];

        const projections: any = {};

        for (const tableId of this.tables) {
            const table = tables[tableId];
            projections[tableId] = [];
            const tFields = this.fields.filter(field => field.table === tableId);

            for(const row of table) {
                const projected: any = {}
                tFields.forEach(field => projected[field.alias ?? field.name] = row[field.name])
                projections[tableId].push(projected)
            }
        }
        
        return result
    }
}
