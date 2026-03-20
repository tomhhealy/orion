/* eslint-disable */
import { AnyDataModel } from 'convex/server'
import type { GenericId } from 'convex/values'

export type TableNames = string
export type Doc = any
export type Id<TableName extends TableNames = TableNames> = GenericId<TableName>
export type DataModel = AnyDataModel
