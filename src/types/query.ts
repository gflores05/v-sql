import * as _ from 'lodash'

export enum LogicalOperator {
  DEFAULT = '',
  EQUAL = '=',
  NOT_EQUAL = '!=',
  GREATER_THAN = '>',
  GREATER_THAN_EQUAL = '>+',
  LESS_THAN = '<',
  LESS_THAN_EQUAL = '<=',
  BETWEEN = 'between',
  NOT_BETWEEN = 'not between',
  LIKE = 'like',
  NOT_LIKE = 'not like'
}
export enum LogicalConnector {
  AND = 'and',
  OR = 'or'
}
export abstract class Condition {
  static parse (strConditions: string[]): Condition[]{
    return []
  }
}
export class SimpleCondition extends Condition {
  constructor (
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
export class BinaryTreeNode {
  public value?: string;
  public left?: BinaryTreeNode | string;
  public right?: BinaryTreeNode | string;
  public parent?: BinaryTreeNode;
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
      
      const table = fieldSplit[0]
      const name = fieldSplit2[0]
      
      if (fieldSplit2.length > 1) {
        return new Field(table, name, fieldSplit2[1])
      }
      return new Field(table, name)
    });
    query.tables = sqlSplit[3].split(',')
    
    const strConditions = sqlSplit.slice(5);
    
    return query
  }
  private buildWhere(strConditions: string) {
    const connectors = {
      and: true,
      or: true
    };
    const grouping = {
      "(": true,
      ")": true
    }

    const operators = {
      ">=": true,
      ">": true,
      "<=": true,
      "<": true,
      "=": true,
      "!=": true,
      "between": true,
      "not between": true,
      "like": true,
      "not like": true
    }

    let evaluating = strConditions
    const expressionStack: BinaryTreeNode[] = []
    let index = -1
    let currentNode = null;

    while (evaluating.length > 0) {
      if (evaluating.startsWith('(')) {
        currentNode = new BinaryTreeNode();
        expressionStack.push(currentNode)
        index++
        evaluating = evaluating.slice(1, evaluating.length)
      } else if (evaluating.startsWith(')')) {
        if (index > 0) {
          index--
          currentNode = expressionStack[index]
        }
        evaluating = evaluating.slice(1, evaluating.length)
      } else {
        const matches = evaluating.match(/^(.*?)(?=\s+(and|or)\s+)/ig)

        if (matches && matches[0] !== '') {
          if (!currentNode) {
            currentNode = new BinaryTreeNode();
          } else if (currentNode.left !== '') {
            currentNode.right = new BinaryTreeNode();
            currentNode = currentNode.right;
          }

          currentNode.left = matches[0]

          evaluating = evaluating.slice(matches[0].length, evaluating.length)
          const operatorMatch = evaluating.match(/\s+(and|or)\s+/ig)

          if (operatorMatch && operatorMatch[0] !== '') {
            evaluating = evaluating.slice(operatorMatch[0].length, evaluating.length)
            currentNode.value = operatorMatch[0].trim()
          }
        }
      }
    }
  }
  run(tables: any) {
    const rawResults = this.crossTables(tables);

    
  }
  private crossTables(tables: any): any[] {
    let results: any[] = []
    
    const projections: any = {}
    
    for (const tableId of this.tables) {
      const table = tables[tableId]
      projections[tableId] = []
      const tFields = this.fields.filter(field => field.table === tableId)
      
      for(const row of table) {
        const projected: any = {}
        tFields.forEach(field => {
          projected[field.alias || field.name] = row[field.name]
        })
        projections[tableId].push(projected)
      }
    }
    let previousResult: any[] = []
    for (const tableId of this.tables) {
      previousResult = results
      results = []
      if(previousResult.length === 0) {
        results = projections[tableId]
      } else {
        for (const irow of previousResult) {
          for (const jrow of projections[tableId]) {
            results.push({
              ...irow,
              ...jrow
            })
          }
        }
      }
    }
    
    return results
  }
}
      