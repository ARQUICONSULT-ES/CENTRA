
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Customer
 * 
 */
export type Customer = $Result.DefaultSelection<Prisma.$CustomerPayload>
/**
 * Model UserCustomer
 * 
 */
export type UserCustomer = $Result.DefaultSelection<Prisma.$UserCustomerPayload>
/**
 * Model Tenant
 * 
 */
export type Tenant = $Result.DefaultSelection<Prisma.$TenantPayload>
/**
 * Model Environment
 * 
 */
export type Environment = $Result.DefaultSelection<Prisma.$EnvironmentPayload>
/**
 * Model Extension
 * 
 */
export type Extension = $Result.DefaultSelection<Prisma.$ExtensionPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  ADMIN: 'ADMIN',
  USER: 'USER'
};

export type Role = (typeof Role)[keyof typeof Role]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.customer`: Exposes CRUD operations for the **Customer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Customers
    * const customers = await prisma.customer.findMany()
    * ```
    */
  get customer(): Prisma.CustomerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userCustomer`: Exposes CRUD operations for the **UserCustomer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserCustomers
    * const userCustomers = await prisma.userCustomer.findMany()
    * ```
    */
  get userCustomer(): Prisma.UserCustomerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenant`: Exposes CRUD operations for the **Tenant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tenants
    * const tenants = await prisma.tenant.findMany()
    * ```
    */
  get tenant(): Prisma.TenantDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.environment`: Exposes CRUD operations for the **Environment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Environments
    * const environments = await prisma.environment.findMany()
    * ```
    */
  get environment(): Prisma.EnvironmentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.extension`: Exposes CRUD operations for the **Extension** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Extensions
    * const extensions = await prisma.extension.findMany()
    * ```
    */
  get extension(): Prisma.ExtensionDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.1.0
   * Query Engine version: ab635e6b9d606fa5c8fb8b1a7f909c3c3c1c98ba
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Customer: 'Customer',
    UserCustomer: 'UserCustomer',
    Tenant: 'Tenant',
    Environment: 'Environment',
    Extension: 'Extension'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "customer" | "userCustomer" | "tenant" | "environment" | "extension"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Customer: {
        payload: Prisma.$CustomerPayload<ExtArgs>
        fields: Prisma.CustomerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CustomerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CustomerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          findFirst: {
            args: Prisma.CustomerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CustomerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          findMany: {
            args: Prisma.CustomerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>[]
          }
          create: {
            args: Prisma.CustomerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          createMany: {
            args: Prisma.CustomerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CustomerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>[]
          }
          delete: {
            args: Prisma.CustomerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          update: {
            args: Prisma.CustomerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          deleteMany: {
            args: Prisma.CustomerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CustomerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CustomerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>[]
          }
          upsert: {
            args: Prisma.CustomerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustomerPayload>
          }
          aggregate: {
            args: Prisma.CustomerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCustomer>
          }
          groupBy: {
            args: Prisma.CustomerGroupByArgs<ExtArgs>
            result: $Utils.Optional<CustomerGroupByOutputType>[]
          }
          count: {
            args: Prisma.CustomerCountArgs<ExtArgs>
            result: $Utils.Optional<CustomerCountAggregateOutputType> | number
          }
        }
      }
      UserCustomer: {
        payload: Prisma.$UserCustomerPayload<ExtArgs>
        fields: Prisma.UserCustomerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserCustomerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCustomerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserCustomerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCustomerPayload>
          }
          findFirst: {
            args: Prisma.UserCustomerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCustomerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserCustomerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCustomerPayload>
          }
          findMany: {
            args: Prisma.UserCustomerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCustomerPayload>[]
          }
          create: {
            args: Prisma.UserCustomerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCustomerPayload>
          }
          createMany: {
            args: Prisma.UserCustomerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCustomerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCustomerPayload>[]
          }
          delete: {
            args: Prisma.UserCustomerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCustomerPayload>
          }
          update: {
            args: Prisma.UserCustomerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCustomerPayload>
          }
          deleteMany: {
            args: Prisma.UserCustomerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserCustomerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserCustomerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCustomerPayload>[]
          }
          upsert: {
            args: Prisma.UserCustomerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCustomerPayload>
          }
          aggregate: {
            args: Prisma.UserCustomerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserCustomer>
          }
          groupBy: {
            args: Prisma.UserCustomerGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserCustomerGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCustomerCountArgs<ExtArgs>
            result: $Utils.Optional<UserCustomerCountAggregateOutputType> | number
          }
        }
      }
      Tenant: {
        payload: Prisma.$TenantPayload<ExtArgs>
        fields: Prisma.TenantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findFirst: {
            args: Prisma.TenantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findMany: {
            args: Prisma.TenantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          create: {
            args: Prisma.TenantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          createMany: {
            args: Prisma.TenantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          delete: {
            args: Prisma.TenantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          update: {
            args: Prisma.TenantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          deleteMany: {
            args: Prisma.TenantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          upsert: {
            args: Prisma.TenantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          aggregate: {
            args: Prisma.TenantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenant>
          }
          groupBy: {
            args: Prisma.TenantGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantCountArgs<ExtArgs>
            result: $Utils.Optional<TenantCountAggregateOutputType> | number
          }
        }
      }
      Environment: {
        payload: Prisma.$EnvironmentPayload<ExtArgs>
        fields: Prisma.EnvironmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EnvironmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnvironmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EnvironmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnvironmentPayload>
          }
          findFirst: {
            args: Prisma.EnvironmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnvironmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EnvironmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnvironmentPayload>
          }
          findMany: {
            args: Prisma.EnvironmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnvironmentPayload>[]
          }
          create: {
            args: Prisma.EnvironmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnvironmentPayload>
          }
          createMany: {
            args: Prisma.EnvironmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EnvironmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnvironmentPayload>[]
          }
          delete: {
            args: Prisma.EnvironmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnvironmentPayload>
          }
          update: {
            args: Prisma.EnvironmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnvironmentPayload>
          }
          deleteMany: {
            args: Prisma.EnvironmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EnvironmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EnvironmentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnvironmentPayload>[]
          }
          upsert: {
            args: Prisma.EnvironmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EnvironmentPayload>
          }
          aggregate: {
            args: Prisma.EnvironmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEnvironment>
          }
          groupBy: {
            args: Prisma.EnvironmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<EnvironmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.EnvironmentCountArgs<ExtArgs>
            result: $Utils.Optional<EnvironmentCountAggregateOutputType> | number
          }
        }
      }
      Extension: {
        payload: Prisma.$ExtensionPayload<ExtArgs>
        fields: Prisma.ExtensionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ExtensionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExtensionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ExtensionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExtensionPayload>
          }
          findFirst: {
            args: Prisma.ExtensionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExtensionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ExtensionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExtensionPayload>
          }
          findMany: {
            args: Prisma.ExtensionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExtensionPayload>[]
          }
          create: {
            args: Prisma.ExtensionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExtensionPayload>
          }
          createMany: {
            args: Prisma.ExtensionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ExtensionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExtensionPayload>[]
          }
          delete: {
            args: Prisma.ExtensionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExtensionPayload>
          }
          update: {
            args: Prisma.ExtensionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExtensionPayload>
          }
          deleteMany: {
            args: Prisma.ExtensionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ExtensionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ExtensionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExtensionPayload>[]
          }
          upsert: {
            args: Prisma.ExtensionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExtensionPayload>
          }
          aggregate: {
            args: Prisma.ExtensionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExtension>
          }
          groupBy: {
            args: Prisma.ExtensionGroupByArgs<ExtArgs>
            result: $Utils.Optional<ExtensionGroupByOutputType>[]
          }
          count: {
            args: Prisma.ExtensionCountArgs<ExtArgs>
            result: $Utils.Optional<ExtensionCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    customer?: CustomerOmit
    userCustomer?: UserCustomerOmit
    tenant?: TenantOmit
    environment?: EnvironmentOmit
    extension?: ExtensionOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    allowedCustomers: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    allowedCustomers?: boolean | UserCountOutputTypeCountAllowedCustomersArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAllowedCustomersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserCustomerWhereInput
  }


  /**
   * Count Type CustomerCountOutputType
   */

  export type CustomerCountOutputType = {
    tenants: number
    allowedUsers: number
  }

  export type CustomerCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenants?: boolean | CustomerCountOutputTypeCountTenantsArgs
    allowedUsers?: boolean | CustomerCountOutputTypeCountAllowedUsersArgs
  }

  // Custom InputTypes
  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomerCountOutputType
     */
    select?: CustomerCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeCountTenantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantWhereInput
  }

  /**
   * CustomerCountOutputType without action
   */
  export type CustomerCountOutputTypeCountAllowedUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserCustomerWhereInput
  }


  /**
   * Count Type TenantCountOutputType
   */

  export type TenantCountOutputType = {
    environments: number
  }

  export type TenantCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    environments?: boolean | TenantCountOutputTypeCountEnvironmentsArgs
  }

  // Custom InputTypes
  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCountOutputType
     */
    select?: TenantCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountEnvironmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EnvironmentWhereInput
  }


  /**
   * Count Type EnvironmentCountOutputType
   */

  export type EnvironmentCountOutputType = {
    extensions: number
  }

  export type EnvironmentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    extensions?: boolean | EnvironmentCountOutputTypeCountExtensionsArgs
  }

  // Custom InputTypes
  /**
   * EnvironmentCountOutputType without action
   */
  export type EnvironmentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EnvironmentCountOutputType
     */
    select?: EnvironmentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * EnvironmentCountOutputType without action
   */
  export type EnvironmentCountOutputTypeCountExtensionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExtensionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    role: $Enums.Role | null
    githubToken: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    role: $Enums.Role | null
    githubToken: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    name: number
    email: number
    password: number
    role: number
    githubToken: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    role?: true
    githubToken?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    role?: true
    githubToken?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    role?: true
    githubToken?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    name: string
    email: string
    password: string
    role: $Enums.Role
    githubToken: string | null
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    githubToken?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    allowedCustomers?: boolean | User$allowedCustomersArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    githubToken?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    githubToken?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    githubToken?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "password" | "role" | "githubToken" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    allowedCustomers?: boolean | User$allowedCustomersArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      allowedCustomers: Prisma.$UserCustomerPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      password: string
      role: $Enums.Role
      githubToken: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    allowedCustomers<T extends User$allowedCustomersArgs<ExtArgs> = {}>(args?: Subset<T, User$allowedCustomersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserCustomerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'Role'>
    readonly githubToken: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.allowedCustomers
   */
  export type User$allowedCustomersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCustomer
     */
    select?: UserCustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCustomer
     */
    omit?: UserCustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCustomerInclude<ExtArgs> | null
    where?: UserCustomerWhereInput
    orderBy?: UserCustomerOrderByWithRelationInput | UserCustomerOrderByWithRelationInput[]
    cursor?: UserCustomerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserCustomerScalarFieldEnum | UserCustomerScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Customer
   */

  export type AggregateCustomer = {
    _count: CustomerCountAggregateOutputType | null
    _min: CustomerMinAggregateOutputType | null
    _max: CustomerMaxAggregateOutputType | null
  }

  export type CustomerMinAggregateOutputType = {
    id: string | null
    customerName: string | null
    imageBase64: string | null
  }

  export type CustomerMaxAggregateOutputType = {
    id: string | null
    customerName: string | null
    imageBase64: string | null
  }

  export type CustomerCountAggregateOutputType = {
    id: number
    customerName: number
    imageBase64: number
    _all: number
  }


  export type CustomerMinAggregateInputType = {
    id?: true
    customerName?: true
    imageBase64?: true
  }

  export type CustomerMaxAggregateInputType = {
    id?: true
    customerName?: true
    imageBase64?: true
  }

  export type CustomerCountAggregateInputType = {
    id?: true
    customerName?: true
    imageBase64?: true
    _all?: true
  }

  export type CustomerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Customer to aggregate.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Customers
    **/
    _count?: true | CustomerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CustomerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CustomerMaxAggregateInputType
  }

  export type GetCustomerAggregateType<T extends CustomerAggregateArgs> = {
        [P in keyof T & keyof AggregateCustomer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCustomer[P]>
      : GetScalarType<T[P], AggregateCustomer[P]>
  }




  export type CustomerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustomerWhereInput
    orderBy?: CustomerOrderByWithAggregationInput | CustomerOrderByWithAggregationInput[]
    by: CustomerScalarFieldEnum[] | CustomerScalarFieldEnum
    having?: CustomerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CustomerCountAggregateInputType | true
    _min?: CustomerMinAggregateInputType
    _max?: CustomerMaxAggregateInputType
  }

  export type CustomerGroupByOutputType = {
    id: string
    customerName: string
    imageBase64: string | null
    _count: CustomerCountAggregateOutputType | null
    _min: CustomerMinAggregateOutputType | null
    _max: CustomerMaxAggregateOutputType | null
  }

  type GetCustomerGroupByPayload<T extends CustomerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CustomerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CustomerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CustomerGroupByOutputType[P]>
            : GetScalarType<T[P], CustomerGroupByOutputType[P]>
        }
      >
    >


  export type CustomerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customerName?: boolean
    imageBase64?: boolean
    tenants?: boolean | Customer$tenantsArgs<ExtArgs>
    allowedUsers?: boolean | Customer$allowedUsersArgs<ExtArgs>
    _count?: boolean | CustomerCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["customer"]>

  export type CustomerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customerName?: boolean
    imageBase64?: boolean
  }, ExtArgs["result"]["customer"]>

  export type CustomerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customerName?: boolean
    imageBase64?: boolean
  }, ExtArgs["result"]["customer"]>

  export type CustomerSelectScalar = {
    id?: boolean
    customerName?: boolean
    imageBase64?: boolean
  }

  export type CustomerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "customerName" | "imageBase64", ExtArgs["result"]["customer"]>
  export type CustomerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenants?: boolean | Customer$tenantsArgs<ExtArgs>
    allowedUsers?: boolean | Customer$allowedUsersArgs<ExtArgs>
    _count?: boolean | CustomerCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CustomerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CustomerIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CustomerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Customer"
    objects: {
      tenants: Prisma.$TenantPayload<ExtArgs>[]
      allowedUsers: Prisma.$UserCustomerPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      customerName: string
      imageBase64: string | null
    }, ExtArgs["result"]["customer"]>
    composites: {}
  }

  type CustomerGetPayload<S extends boolean | null | undefined | CustomerDefaultArgs> = $Result.GetResult<Prisma.$CustomerPayload, S>

  type CustomerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CustomerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CustomerCountAggregateInputType | true
    }

  export interface CustomerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Customer'], meta: { name: 'Customer' } }
    /**
     * Find zero or one Customer that matches the filter.
     * @param {CustomerFindUniqueArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CustomerFindUniqueArgs>(args: SelectSubset<T, CustomerFindUniqueArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Customer that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CustomerFindUniqueOrThrowArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CustomerFindUniqueOrThrowArgs>(args: SelectSubset<T, CustomerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Customer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerFindFirstArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CustomerFindFirstArgs>(args?: SelectSubset<T, CustomerFindFirstArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Customer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerFindFirstOrThrowArgs} args - Arguments to find a Customer
     * @example
     * // Get one Customer
     * const customer = await prisma.customer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CustomerFindFirstOrThrowArgs>(args?: SelectSubset<T, CustomerFindFirstOrThrowArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Customers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Customers
     * const customers = await prisma.customer.findMany()
     * 
     * // Get first 10 Customers
     * const customers = await prisma.customer.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const customerWithIdOnly = await prisma.customer.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CustomerFindManyArgs>(args?: SelectSubset<T, CustomerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Customer.
     * @param {CustomerCreateArgs} args - Arguments to create a Customer.
     * @example
     * // Create one Customer
     * const Customer = await prisma.customer.create({
     *   data: {
     *     // ... data to create a Customer
     *   }
     * })
     * 
     */
    create<T extends CustomerCreateArgs>(args: SelectSubset<T, CustomerCreateArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Customers.
     * @param {CustomerCreateManyArgs} args - Arguments to create many Customers.
     * @example
     * // Create many Customers
     * const customer = await prisma.customer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CustomerCreateManyArgs>(args?: SelectSubset<T, CustomerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Customers and returns the data saved in the database.
     * @param {CustomerCreateManyAndReturnArgs} args - Arguments to create many Customers.
     * @example
     * // Create many Customers
     * const customer = await prisma.customer.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Customers and only return the `id`
     * const customerWithIdOnly = await prisma.customer.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CustomerCreateManyAndReturnArgs>(args?: SelectSubset<T, CustomerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Customer.
     * @param {CustomerDeleteArgs} args - Arguments to delete one Customer.
     * @example
     * // Delete one Customer
     * const Customer = await prisma.customer.delete({
     *   where: {
     *     // ... filter to delete one Customer
     *   }
     * })
     * 
     */
    delete<T extends CustomerDeleteArgs>(args: SelectSubset<T, CustomerDeleteArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Customer.
     * @param {CustomerUpdateArgs} args - Arguments to update one Customer.
     * @example
     * // Update one Customer
     * const customer = await prisma.customer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CustomerUpdateArgs>(args: SelectSubset<T, CustomerUpdateArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Customers.
     * @param {CustomerDeleteManyArgs} args - Arguments to filter Customers to delete.
     * @example
     * // Delete a few Customers
     * const { count } = await prisma.customer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CustomerDeleteManyArgs>(args?: SelectSubset<T, CustomerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Customers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Customers
     * const customer = await prisma.customer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CustomerUpdateManyArgs>(args: SelectSubset<T, CustomerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Customers and returns the data updated in the database.
     * @param {CustomerUpdateManyAndReturnArgs} args - Arguments to update many Customers.
     * @example
     * // Update many Customers
     * const customer = await prisma.customer.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Customers and only return the `id`
     * const customerWithIdOnly = await prisma.customer.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CustomerUpdateManyAndReturnArgs>(args: SelectSubset<T, CustomerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Customer.
     * @param {CustomerUpsertArgs} args - Arguments to update or create a Customer.
     * @example
     * // Update or create a Customer
     * const customer = await prisma.customer.upsert({
     *   create: {
     *     // ... data to create a Customer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Customer we want to update
     *   }
     * })
     */
    upsert<T extends CustomerUpsertArgs>(args: SelectSubset<T, CustomerUpsertArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Customers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerCountArgs} args - Arguments to filter Customers to count.
     * @example
     * // Count the number of Customers
     * const count = await prisma.customer.count({
     *   where: {
     *     // ... the filter for the Customers we want to count
     *   }
     * })
    **/
    count<T extends CustomerCountArgs>(
      args?: Subset<T, CustomerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CustomerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Customer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CustomerAggregateArgs>(args: Subset<T, CustomerAggregateArgs>): Prisma.PrismaPromise<GetCustomerAggregateType<T>>

    /**
     * Group by Customer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustomerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CustomerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CustomerGroupByArgs['orderBy'] }
        : { orderBy?: CustomerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CustomerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCustomerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Customer model
   */
  readonly fields: CustomerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Customer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CustomerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenants<T extends Customer$tenantsArgs<ExtArgs> = {}>(args?: Subset<T, Customer$tenantsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    allowedUsers<T extends Customer$allowedUsersArgs<ExtArgs> = {}>(args?: Subset<T, Customer$allowedUsersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserCustomerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Customer model
   */
  interface CustomerFieldRefs {
    readonly id: FieldRef<"Customer", 'String'>
    readonly customerName: FieldRef<"Customer", 'String'>
    readonly imageBase64: FieldRef<"Customer", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Customer findUnique
   */
  export type CustomerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer findUniqueOrThrow
   */
  export type CustomerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer findFirst
   */
  export type CustomerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Customers.
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Customers.
     */
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Customer findFirstOrThrow
   */
  export type CustomerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customer to fetch.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Customers.
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Customers.
     */
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Customer findMany
   */
  export type CustomerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter, which Customers to fetch.
     */
    where?: CustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Customers to fetch.
     */
    orderBy?: CustomerOrderByWithRelationInput | CustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Customers.
     */
    cursor?: CustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Customers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Customers.
     */
    skip?: number
    distinct?: CustomerScalarFieldEnum | CustomerScalarFieldEnum[]
  }

  /**
   * Customer create
   */
  export type CustomerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * The data needed to create a Customer.
     */
    data: XOR<CustomerCreateInput, CustomerUncheckedCreateInput>
  }

  /**
   * Customer createMany
   */
  export type CustomerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Customers.
     */
    data: CustomerCreateManyInput | CustomerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Customer createManyAndReturn
   */
  export type CustomerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * The data used to create many Customers.
     */
    data: CustomerCreateManyInput | CustomerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Customer update
   */
  export type CustomerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * The data needed to update a Customer.
     */
    data: XOR<CustomerUpdateInput, CustomerUncheckedUpdateInput>
    /**
     * Choose, which Customer to update.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer updateMany
   */
  export type CustomerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Customers.
     */
    data: XOR<CustomerUpdateManyMutationInput, CustomerUncheckedUpdateManyInput>
    /**
     * Filter which Customers to update
     */
    where?: CustomerWhereInput
    /**
     * Limit how many Customers to update.
     */
    limit?: number
  }

  /**
   * Customer updateManyAndReturn
   */
  export type CustomerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * The data used to update Customers.
     */
    data: XOR<CustomerUpdateManyMutationInput, CustomerUncheckedUpdateManyInput>
    /**
     * Filter which Customers to update
     */
    where?: CustomerWhereInput
    /**
     * Limit how many Customers to update.
     */
    limit?: number
  }

  /**
   * Customer upsert
   */
  export type CustomerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * The filter to search for the Customer to update in case it exists.
     */
    where: CustomerWhereUniqueInput
    /**
     * In case the Customer found by the `where` argument doesn't exist, create a new Customer with this data.
     */
    create: XOR<CustomerCreateInput, CustomerUncheckedCreateInput>
    /**
     * In case the Customer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CustomerUpdateInput, CustomerUncheckedUpdateInput>
  }

  /**
   * Customer delete
   */
  export type CustomerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
    /**
     * Filter which Customer to delete.
     */
    where: CustomerWhereUniqueInput
  }

  /**
   * Customer deleteMany
   */
  export type CustomerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Customers to delete
     */
    where?: CustomerWhereInput
    /**
     * Limit how many Customers to delete.
     */
    limit?: number
  }

  /**
   * Customer.tenants
   */
  export type Customer$tenantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    where?: TenantWhereInput
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    cursor?: TenantWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Customer.allowedUsers
   */
  export type Customer$allowedUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCustomer
     */
    select?: UserCustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCustomer
     */
    omit?: UserCustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCustomerInclude<ExtArgs> | null
    where?: UserCustomerWhereInput
    orderBy?: UserCustomerOrderByWithRelationInput | UserCustomerOrderByWithRelationInput[]
    cursor?: UserCustomerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserCustomerScalarFieldEnum | UserCustomerScalarFieldEnum[]
  }

  /**
   * Customer without action
   */
  export type CustomerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Customer
     */
    select?: CustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Customer
     */
    omit?: CustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustomerInclude<ExtArgs> | null
  }


  /**
   * Model UserCustomer
   */

  export type AggregateUserCustomer = {
    _count: UserCustomerCountAggregateOutputType | null
    _min: UserCustomerMinAggregateOutputType | null
    _max: UserCustomerMaxAggregateOutputType | null
  }

  export type UserCustomerMinAggregateOutputType = {
    userId: string | null
    customerId: string | null
    assignedAt: Date | null
  }

  export type UserCustomerMaxAggregateOutputType = {
    userId: string | null
    customerId: string | null
    assignedAt: Date | null
  }

  export type UserCustomerCountAggregateOutputType = {
    userId: number
    customerId: number
    assignedAt: number
    _all: number
  }


  export type UserCustomerMinAggregateInputType = {
    userId?: true
    customerId?: true
    assignedAt?: true
  }

  export type UserCustomerMaxAggregateInputType = {
    userId?: true
    customerId?: true
    assignedAt?: true
  }

  export type UserCustomerCountAggregateInputType = {
    userId?: true
    customerId?: true
    assignedAt?: true
    _all?: true
  }

  export type UserCustomerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserCustomer to aggregate.
     */
    where?: UserCustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserCustomers to fetch.
     */
    orderBy?: UserCustomerOrderByWithRelationInput | UserCustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserCustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserCustomers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserCustomers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserCustomers
    **/
    _count?: true | UserCustomerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserCustomerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserCustomerMaxAggregateInputType
  }

  export type GetUserCustomerAggregateType<T extends UserCustomerAggregateArgs> = {
        [P in keyof T & keyof AggregateUserCustomer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserCustomer[P]>
      : GetScalarType<T[P], AggregateUserCustomer[P]>
  }




  export type UserCustomerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserCustomerWhereInput
    orderBy?: UserCustomerOrderByWithAggregationInput | UserCustomerOrderByWithAggregationInput[]
    by: UserCustomerScalarFieldEnum[] | UserCustomerScalarFieldEnum
    having?: UserCustomerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCustomerCountAggregateInputType | true
    _min?: UserCustomerMinAggregateInputType
    _max?: UserCustomerMaxAggregateInputType
  }

  export type UserCustomerGroupByOutputType = {
    userId: string
    customerId: string
    assignedAt: Date
    _count: UserCustomerCountAggregateOutputType | null
    _min: UserCustomerMinAggregateOutputType | null
    _max: UserCustomerMaxAggregateOutputType | null
  }

  type GetUserCustomerGroupByPayload<T extends UserCustomerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserCustomerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserCustomerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserCustomerGroupByOutputType[P]>
            : GetScalarType<T[P], UserCustomerGroupByOutputType[P]>
        }
      >
    >


  export type UserCustomerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    userId?: boolean
    customerId?: boolean
    assignedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userCustomer"]>

  export type UserCustomerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    userId?: boolean
    customerId?: boolean
    assignedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userCustomer"]>

  export type UserCustomerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    userId?: boolean
    customerId?: boolean
    assignedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userCustomer"]>

  export type UserCustomerSelectScalar = {
    userId?: boolean
    customerId?: boolean
    assignedAt?: boolean
  }

  export type UserCustomerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"userId" | "customerId" | "assignedAt", ExtArgs["result"]["userCustomer"]>
  export type UserCustomerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }
  export type UserCustomerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }
  export type UserCustomerIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }

  export type $UserCustomerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserCustomer"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      customer: Prisma.$CustomerPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      userId: string
      customerId: string
      assignedAt: Date
    }, ExtArgs["result"]["userCustomer"]>
    composites: {}
  }

  type UserCustomerGetPayload<S extends boolean | null | undefined | UserCustomerDefaultArgs> = $Result.GetResult<Prisma.$UserCustomerPayload, S>

  type UserCustomerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserCustomerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCustomerCountAggregateInputType | true
    }

  export interface UserCustomerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserCustomer'], meta: { name: 'UserCustomer' } }
    /**
     * Find zero or one UserCustomer that matches the filter.
     * @param {UserCustomerFindUniqueArgs} args - Arguments to find a UserCustomer
     * @example
     * // Get one UserCustomer
     * const userCustomer = await prisma.userCustomer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserCustomerFindUniqueArgs>(args: SelectSubset<T, UserCustomerFindUniqueArgs<ExtArgs>>): Prisma__UserCustomerClient<$Result.GetResult<Prisma.$UserCustomerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserCustomer that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserCustomerFindUniqueOrThrowArgs} args - Arguments to find a UserCustomer
     * @example
     * // Get one UserCustomer
     * const userCustomer = await prisma.userCustomer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserCustomerFindUniqueOrThrowArgs>(args: SelectSubset<T, UserCustomerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserCustomerClient<$Result.GetResult<Prisma.$UserCustomerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserCustomer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCustomerFindFirstArgs} args - Arguments to find a UserCustomer
     * @example
     * // Get one UserCustomer
     * const userCustomer = await prisma.userCustomer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserCustomerFindFirstArgs>(args?: SelectSubset<T, UserCustomerFindFirstArgs<ExtArgs>>): Prisma__UserCustomerClient<$Result.GetResult<Prisma.$UserCustomerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserCustomer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCustomerFindFirstOrThrowArgs} args - Arguments to find a UserCustomer
     * @example
     * // Get one UserCustomer
     * const userCustomer = await prisma.userCustomer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserCustomerFindFirstOrThrowArgs>(args?: SelectSubset<T, UserCustomerFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserCustomerClient<$Result.GetResult<Prisma.$UserCustomerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserCustomers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCustomerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserCustomers
     * const userCustomers = await prisma.userCustomer.findMany()
     * 
     * // Get first 10 UserCustomers
     * const userCustomers = await prisma.userCustomer.findMany({ take: 10 })
     * 
     * // Only select the `userId`
     * const userCustomerWithUserIdOnly = await prisma.userCustomer.findMany({ select: { userId: true } })
     * 
     */
    findMany<T extends UserCustomerFindManyArgs>(args?: SelectSubset<T, UserCustomerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserCustomerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserCustomer.
     * @param {UserCustomerCreateArgs} args - Arguments to create a UserCustomer.
     * @example
     * // Create one UserCustomer
     * const UserCustomer = await prisma.userCustomer.create({
     *   data: {
     *     // ... data to create a UserCustomer
     *   }
     * })
     * 
     */
    create<T extends UserCustomerCreateArgs>(args: SelectSubset<T, UserCustomerCreateArgs<ExtArgs>>): Prisma__UserCustomerClient<$Result.GetResult<Prisma.$UserCustomerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserCustomers.
     * @param {UserCustomerCreateManyArgs} args - Arguments to create many UserCustomers.
     * @example
     * // Create many UserCustomers
     * const userCustomer = await prisma.userCustomer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCustomerCreateManyArgs>(args?: SelectSubset<T, UserCustomerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserCustomers and returns the data saved in the database.
     * @param {UserCustomerCreateManyAndReturnArgs} args - Arguments to create many UserCustomers.
     * @example
     * // Create many UserCustomers
     * const userCustomer = await prisma.userCustomer.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserCustomers and only return the `userId`
     * const userCustomerWithUserIdOnly = await prisma.userCustomer.createManyAndReturn({
     *   select: { userId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCustomerCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCustomerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserCustomerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserCustomer.
     * @param {UserCustomerDeleteArgs} args - Arguments to delete one UserCustomer.
     * @example
     * // Delete one UserCustomer
     * const UserCustomer = await prisma.userCustomer.delete({
     *   where: {
     *     // ... filter to delete one UserCustomer
     *   }
     * })
     * 
     */
    delete<T extends UserCustomerDeleteArgs>(args: SelectSubset<T, UserCustomerDeleteArgs<ExtArgs>>): Prisma__UserCustomerClient<$Result.GetResult<Prisma.$UserCustomerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserCustomer.
     * @param {UserCustomerUpdateArgs} args - Arguments to update one UserCustomer.
     * @example
     * // Update one UserCustomer
     * const userCustomer = await prisma.userCustomer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserCustomerUpdateArgs>(args: SelectSubset<T, UserCustomerUpdateArgs<ExtArgs>>): Prisma__UserCustomerClient<$Result.GetResult<Prisma.$UserCustomerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserCustomers.
     * @param {UserCustomerDeleteManyArgs} args - Arguments to filter UserCustomers to delete.
     * @example
     * // Delete a few UserCustomers
     * const { count } = await prisma.userCustomer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserCustomerDeleteManyArgs>(args?: SelectSubset<T, UserCustomerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserCustomers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCustomerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserCustomers
     * const userCustomer = await prisma.userCustomer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserCustomerUpdateManyArgs>(args: SelectSubset<T, UserCustomerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserCustomers and returns the data updated in the database.
     * @param {UserCustomerUpdateManyAndReturnArgs} args - Arguments to update many UserCustomers.
     * @example
     * // Update many UserCustomers
     * const userCustomer = await prisma.userCustomer.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserCustomers and only return the `userId`
     * const userCustomerWithUserIdOnly = await prisma.userCustomer.updateManyAndReturn({
     *   select: { userId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserCustomerUpdateManyAndReturnArgs>(args: SelectSubset<T, UserCustomerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserCustomerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserCustomer.
     * @param {UserCustomerUpsertArgs} args - Arguments to update or create a UserCustomer.
     * @example
     * // Update or create a UserCustomer
     * const userCustomer = await prisma.userCustomer.upsert({
     *   create: {
     *     // ... data to create a UserCustomer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserCustomer we want to update
     *   }
     * })
     */
    upsert<T extends UserCustomerUpsertArgs>(args: SelectSubset<T, UserCustomerUpsertArgs<ExtArgs>>): Prisma__UserCustomerClient<$Result.GetResult<Prisma.$UserCustomerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserCustomers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCustomerCountArgs} args - Arguments to filter UserCustomers to count.
     * @example
     * // Count the number of UserCustomers
     * const count = await prisma.userCustomer.count({
     *   where: {
     *     // ... the filter for the UserCustomers we want to count
     *   }
     * })
    **/
    count<T extends UserCustomerCountArgs>(
      args?: Subset<T, UserCustomerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCustomerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserCustomer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCustomerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserCustomerAggregateArgs>(args: Subset<T, UserCustomerAggregateArgs>): Prisma.PrismaPromise<GetUserCustomerAggregateType<T>>

    /**
     * Group by UserCustomer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCustomerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserCustomerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserCustomerGroupByArgs['orderBy'] }
        : { orderBy?: UserCustomerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserCustomerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserCustomerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserCustomer model
   */
  readonly fields: UserCustomerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserCustomer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserCustomerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    customer<T extends CustomerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CustomerDefaultArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserCustomer model
   */
  interface UserCustomerFieldRefs {
    readonly userId: FieldRef<"UserCustomer", 'String'>
    readonly customerId: FieldRef<"UserCustomer", 'String'>
    readonly assignedAt: FieldRef<"UserCustomer", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserCustomer findUnique
   */
  export type UserCustomerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCustomer
     */
    select?: UserCustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCustomer
     */
    omit?: UserCustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCustomerInclude<ExtArgs> | null
    /**
     * Filter, which UserCustomer to fetch.
     */
    where: UserCustomerWhereUniqueInput
  }

  /**
   * UserCustomer findUniqueOrThrow
   */
  export type UserCustomerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCustomer
     */
    select?: UserCustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCustomer
     */
    omit?: UserCustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCustomerInclude<ExtArgs> | null
    /**
     * Filter, which UserCustomer to fetch.
     */
    where: UserCustomerWhereUniqueInput
  }

  /**
   * UserCustomer findFirst
   */
  export type UserCustomerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCustomer
     */
    select?: UserCustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCustomer
     */
    omit?: UserCustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCustomerInclude<ExtArgs> | null
    /**
     * Filter, which UserCustomer to fetch.
     */
    where?: UserCustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserCustomers to fetch.
     */
    orderBy?: UserCustomerOrderByWithRelationInput | UserCustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserCustomers.
     */
    cursor?: UserCustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserCustomers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserCustomers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserCustomers.
     */
    distinct?: UserCustomerScalarFieldEnum | UserCustomerScalarFieldEnum[]
  }

  /**
   * UserCustomer findFirstOrThrow
   */
  export type UserCustomerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCustomer
     */
    select?: UserCustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCustomer
     */
    omit?: UserCustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCustomerInclude<ExtArgs> | null
    /**
     * Filter, which UserCustomer to fetch.
     */
    where?: UserCustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserCustomers to fetch.
     */
    orderBy?: UserCustomerOrderByWithRelationInput | UserCustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserCustomers.
     */
    cursor?: UserCustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserCustomers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserCustomers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserCustomers.
     */
    distinct?: UserCustomerScalarFieldEnum | UserCustomerScalarFieldEnum[]
  }

  /**
   * UserCustomer findMany
   */
  export type UserCustomerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCustomer
     */
    select?: UserCustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCustomer
     */
    omit?: UserCustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCustomerInclude<ExtArgs> | null
    /**
     * Filter, which UserCustomers to fetch.
     */
    where?: UserCustomerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserCustomers to fetch.
     */
    orderBy?: UserCustomerOrderByWithRelationInput | UserCustomerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserCustomers.
     */
    cursor?: UserCustomerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserCustomers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserCustomers.
     */
    skip?: number
    distinct?: UserCustomerScalarFieldEnum | UserCustomerScalarFieldEnum[]
  }

  /**
   * UserCustomer create
   */
  export type UserCustomerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCustomer
     */
    select?: UserCustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCustomer
     */
    omit?: UserCustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCustomerInclude<ExtArgs> | null
    /**
     * The data needed to create a UserCustomer.
     */
    data: XOR<UserCustomerCreateInput, UserCustomerUncheckedCreateInput>
  }

  /**
   * UserCustomer createMany
   */
  export type UserCustomerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserCustomers.
     */
    data: UserCustomerCreateManyInput | UserCustomerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserCustomer createManyAndReturn
   */
  export type UserCustomerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCustomer
     */
    select?: UserCustomerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserCustomer
     */
    omit?: UserCustomerOmit<ExtArgs> | null
    /**
     * The data used to create many UserCustomers.
     */
    data: UserCustomerCreateManyInput | UserCustomerCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCustomerIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserCustomer update
   */
  export type UserCustomerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCustomer
     */
    select?: UserCustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCustomer
     */
    omit?: UserCustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCustomerInclude<ExtArgs> | null
    /**
     * The data needed to update a UserCustomer.
     */
    data: XOR<UserCustomerUpdateInput, UserCustomerUncheckedUpdateInput>
    /**
     * Choose, which UserCustomer to update.
     */
    where: UserCustomerWhereUniqueInput
  }

  /**
   * UserCustomer updateMany
   */
  export type UserCustomerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserCustomers.
     */
    data: XOR<UserCustomerUpdateManyMutationInput, UserCustomerUncheckedUpdateManyInput>
    /**
     * Filter which UserCustomers to update
     */
    where?: UserCustomerWhereInput
    /**
     * Limit how many UserCustomers to update.
     */
    limit?: number
  }

  /**
   * UserCustomer updateManyAndReturn
   */
  export type UserCustomerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCustomer
     */
    select?: UserCustomerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserCustomer
     */
    omit?: UserCustomerOmit<ExtArgs> | null
    /**
     * The data used to update UserCustomers.
     */
    data: XOR<UserCustomerUpdateManyMutationInput, UserCustomerUncheckedUpdateManyInput>
    /**
     * Filter which UserCustomers to update
     */
    where?: UserCustomerWhereInput
    /**
     * Limit how many UserCustomers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCustomerIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserCustomer upsert
   */
  export type UserCustomerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCustomer
     */
    select?: UserCustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCustomer
     */
    omit?: UserCustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCustomerInclude<ExtArgs> | null
    /**
     * The filter to search for the UserCustomer to update in case it exists.
     */
    where: UserCustomerWhereUniqueInput
    /**
     * In case the UserCustomer found by the `where` argument doesn't exist, create a new UserCustomer with this data.
     */
    create: XOR<UserCustomerCreateInput, UserCustomerUncheckedCreateInput>
    /**
     * In case the UserCustomer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserCustomerUpdateInput, UserCustomerUncheckedUpdateInput>
  }

  /**
   * UserCustomer delete
   */
  export type UserCustomerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCustomer
     */
    select?: UserCustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCustomer
     */
    omit?: UserCustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCustomerInclude<ExtArgs> | null
    /**
     * Filter which UserCustomer to delete.
     */
    where: UserCustomerWhereUniqueInput
  }

  /**
   * UserCustomer deleteMany
   */
  export type UserCustomerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserCustomers to delete
     */
    where?: UserCustomerWhereInput
    /**
     * Limit how many UserCustomers to delete.
     */
    limit?: number
  }

  /**
   * UserCustomer without action
   */
  export type UserCustomerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCustomer
     */
    select?: UserCustomerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCustomer
     */
    omit?: UserCustomerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCustomerInclude<ExtArgs> | null
  }


  /**
   * Model Tenant
   */

  export type AggregateTenant = {
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  export type TenantMinAggregateOutputType = {
    id: string | null
    customerId: string | null
    description: string | null
    createdAt: Date | null
    modifiedAt: Date | null
    connectionId: string | null
    grantType: string | null
    clientId: string | null
    clientSecret: string | null
    scope: string | null
    token: string | null
    tokenExpiresAt: Date | null
  }

  export type TenantMaxAggregateOutputType = {
    id: string | null
    customerId: string | null
    description: string | null
    createdAt: Date | null
    modifiedAt: Date | null
    connectionId: string | null
    grantType: string | null
    clientId: string | null
    clientSecret: string | null
    scope: string | null
    token: string | null
    tokenExpiresAt: Date | null
  }

  export type TenantCountAggregateOutputType = {
    id: number
    customerId: number
    description: number
    createdAt: number
    modifiedAt: number
    connectionId: number
    grantType: number
    clientId: number
    clientSecret: number
    scope: number
    token: number
    tokenExpiresAt: number
    _all: number
  }


  export type TenantMinAggregateInputType = {
    id?: true
    customerId?: true
    description?: true
    createdAt?: true
    modifiedAt?: true
    connectionId?: true
    grantType?: true
    clientId?: true
    clientSecret?: true
    scope?: true
    token?: true
    tokenExpiresAt?: true
  }

  export type TenantMaxAggregateInputType = {
    id?: true
    customerId?: true
    description?: true
    createdAt?: true
    modifiedAt?: true
    connectionId?: true
    grantType?: true
    clientId?: true
    clientSecret?: true
    scope?: true
    token?: true
    tokenExpiresAt?: true
  }

  export type TenantCountAggregateInputType = {
    id?: true
    customerId?: true
    description?: true
    createdAt?: true
    modifiedAt?: true
    connectionId?: true
    grantType?: true
    clientId?: true
    clientSecret?: true
    scope?: true
    token?: true
    tokenExpiresAt?: true
    _all?: true
  }

  export type TenantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenant to aggregate.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tenants
    **/
    _count?: true | TenantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantMaxAggregateInputType
  }

  export type GetTenantAggregateType<T extends TenantAggregateArgs> = {
        [P in keyof T & keyof AggregateTenant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenant[P]>
      : GetScalarType<T[P], AggregateTenant[P]>
  }




  export type TenantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantWhereInput
    orderBy?: TenantOrderByWithAggregationInput | TenantOrderByWithAggregationInput[]
    by: TenantScalarFieldEnum[] | TenantScalarFieldEnum
    having?: TenantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantCountAggregateInputType | true
    _min?: TenantMinAggregateInputType
    _max?: TenantMaxAggregateInputType
  }

  export type TenantGroupByOutputType = {
    id: string
    customerId: string
    description: string | null
    createdAt: Date
    modifiedAt: Date
    connectionId: string | null
    grantType: string | null
    clientId: string | null
    clientSecret: string | null
    scope: string | null
    token: string | null
    tokenExpiresAt: Date | null
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  type GetTenantGroupByPayload<T extends TenantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantGroupByOutputType[P]>
            : GetScalarType<T[P], TenantGroupByOutputType[P]>
        }
      >
    >


  export type TenantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customerId?: boolean
    description?: boolean
    createdAt?: boolean
    modifiedAt?: boolean
    connectionId?: boolean
    grantType?: boolean
    clientId?: boolean
    clientSecret?: boolean
    scope?: boolean
    token?: boolean
    tokenExpiresAt?: boolean
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
    environments?: boolean | Tenant$environmentsArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customerId?: boolean
    description?: boolean
    createdAt?: boolean
    modifiedAt?: boolean
    connectionId?: boolean
    grantType?: boolean
    clientId?: boolean
    clientSecret?: boolean
    scope?: boolean
    token?: boolean
    tokenExpiresAt?: boolean
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    customerId?: boolean
    description?: boolean
    createdAt?: boolean
    modifiedAt?: boolean
    connectionId?: boolean
    grantType?: boolean
    clientId?: boolean
    clientSecret?: boolean
    scope?: boolean
    token?: boolean
    tokenExpiresAt?: boolean
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectScalar = {
    id?: boolean
    customerId?: boolean
    description?: boolean
    createdAt?: boolean
    modifiedAt?: boolean
    connectionId?: boolean
    grantType?: boolean
    clientId?: boolean
    clientSecret?: boolean
    scope?: boolean
    token?: boolean
    tokenExpiresAt?: boolean
  }

  export type TenantOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "customerId" | "description" | "createdAt" | "modifiedAt" | "connectionId" | "grantType" | "clientId" | "clientSecret" | "scope" | "token" | "tokenExpiresAt", ExtArgs["result"]["tenant"]>
  export type TenantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
    environments?: boolean | Tenant$environmentsArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TenantIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }
  export type TenantIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    customer?: boolean | CustomerDefaultArgs<ExtArgs>
  }

  export type $TenantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tenant"
    objects: {
      customer: Prisma.$CustomerPayload<ExtArgs>
      environments: Prisma.$EnvironmentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      customerId: string
      description: string | null
      createdAt: Date
      modifiedAt: Date
      connectionId: string | null
      grantType: string | null
      clientId: string | null
      clientSecret: string | null
      scope: string | null
      token: string | null
      tokenExpiresAt: Date | null
    }, ExtArgs["result"]["tenant"]>
    composites: {}
  }

  type TenantGetPayload<S extends boolean | null | undefined | TenantDefaultArgs> = $Result.GetResult<Prisma.$TenantPayload, S>

  type TenantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantCountAggregateInputType | true
    }

  export interface TenantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tenant'], meta: { name: 'Tenant' } }
    /**
     * Find zero or one Tenant that matches the filter.
     * @param {TenantFindUniqueArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantFindUniqueArgs>(args: SelectSubset<T, TenantFindUniqueArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tenant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantFindUniqueOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantFindFirstArgs>(args?: SelectSubset<T, TenantFindFirstArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tenants
     * const tenants = await prisma.tenant.findMany()
     * 
     * // Get first 10 Tenants
     * const tenants = await prisma.tenant.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantWithIdOnly = await prisma.tenant.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantFindManyArgs>(args?: SelectSubset<T, TenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tenant.
     * @param {TenantCreateArgs} args - Arguments to create a Tenant.
     * @example
     * // Create one Tenant
     * const Tenant = await prisma.tenant.create({
     *   data: {
     *     // ... data to create a Tenant
     *   }
     * })
     * 
     */
    create<T extends TenantCreateArgs>(args: SelectSubset<T, TenantCreateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tenants.
     * @param {TenantCreateManyArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantCreateManyArgs>(args?: SelectSubset<T, TenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tenants and returns the data saved in the database.
     * @param {TenantCreateManyAndReturnArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tenant.
     * @param {TenantDeleteArgs} args - Arguments to delete one Tenant.
     * @example
     * // Delete one Tenant
     * const Tenant = await prisma.tenant.delete({
     *   where: {
     *     // ... filter to delete one Tenant
     *   }
     * })
     * 
     */
    delete<T extends TenantDeleteArgs>(args: SelectSubset<T, TenantDeleteArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tenant.
     * @param {TenantUpdateArgs} args - Arguments to update one Tenant.
     * @example
     * // Update one Tenant
     * const tenant = await prisma.tenant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantUpdateArgs>(args: SelectSubset<T, TenantUpdateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tenants.
     * @param {TenantDeleteManyArgs} args - Arguments to filter Tenants to delete.
     * @example
     * // Delete a few Tenants
     * const { count } = await prisma.tenant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantDeleteManyArgs>(args?: SelectSubset<T, TenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantUpdateManyArgs>(args: SelectSubset<T, TenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants and returns the data updated in the database.
     * @param {TenantUpdateManyAndReturnArgs} args - Arguments to update many Tenants.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TenantUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tenant.
     * @param {TenantUpsertArgs} args - Arguments to update or create a Tenant.
     * @example
     * // Update or create a Tenant
     * const tenant = await prisma.tenant.upsert({
     *   create: {
     *     // ... data to create a Tenant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tenant we want to update
     *   }
     * })
     */
    upsert<T extends TenantUpsertArgs>(args: SelectSubset<T, TenantUpsertArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCountArgs} args - Arguments to filter Tenants to count.
     * @example
     * // Count the number of Tenants
     * const count = await prisma.tenant.count({
     *   where: {
     *     // ... the filter for the Tenants we want to count
     *   }
     * })
    **/
    count<T extends TenantCountArgs>(
      args?: Subset<T, TenantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantAggregateArgs>(args: Subset<T, TenantAggregateArgs>): Prisma.PrismaPromise<GetTenantAggregateType<T>>

    /**
     * Group by Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantGroupByArgs['orderBy'] }
        : { orderBy?: TenantGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tenant model
   */
  readonly fields: TenantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tenant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    customer<T extends CustomerDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CustomerDefaultArgs<ExtArgs>>): Prisma__CustomerClient<$Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    environments<T extends Tenant$environmentsArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$environmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EnvironmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Tenant model
   */
  interface TenantFieldRefs {
    readonly id: FieldRef<"Tenant", 'String'>
    readonly customerId: FieldRef<"Tenant", 'String'>
    readonly description: FieldRef<"Tenant", 'String'>
    readonly createdAt: FieldRef<"Tenant", 'DateTime'>
    readonly modifiedAt: FieldRef<"Tenant", 'DateTime'>
    readonly connectionId: FieldRef<"Tenant", 'String'>
    readonly grantType: FieldRef<"Tenant", 'String'>
    readonly clientId: FieldRef<"Tenant", 'String'>
    readonly clientSecret: FieldRef<"Tenant", 'String'>
    readonly scope: FieldRef<"Tenant", 'String'>
    readonly token: FieldRef<"Tenant", 'String'>
    readonly tokenExpiresAt: FieldRef<"Tenant", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Tenant findUnique
   */
  export type TenantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findUniqueOrThrow
   */
  export type TenantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findFirst
   */
  export type TenantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findFirstOrThrow
   */
  export type TenantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findMany
   */
  export type TenantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenants to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant create
   */
  export type TenantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to create a Tenant.
     */
    data: XOR<TenantCreateInput, TenantUncheckedCreateInput>
  }

  /**
   * Tenant createMany
   */
  export type TenantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant createManyAndReturn
   */
  export type TenantCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Tenant update
   */
  export type TenantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to update a Tenant.
     */
    data: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
    /**
     * Choose, which Tenant to update.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant updateMany
   */
  export type TenantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
  }

  /**
   * Tenant updateManyAndReturn
   */
  export type TenantUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Tenant upsert
   */
  export type TenantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The filter to search for the Tenant to update in case it exists.
     */
    where: TenantWhereUniqueInput
    /**
     * In case the Tenant found by the `where` argument doesn't exist, create a new Tenant with this data.
     */
    create: XOR<TenantCreateInput, TenantUncheckedCreateInput>
    /**
     * In case the Tenant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
  }

  /**
   * Tenant delete
   */
  export type TenantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter which Tenant to delete.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant deleteMany
   */
  export type TenantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenants to delete
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to delete.
     */
    limit?: number
  }

  /**
   * Tenant.environments
   */
  export type Tenant$environmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Environment
     */
    select?: EnvironmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Environment
     */
    omit?: EnvironmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnvironmentInclude<ExtArgs> | null
    where?: EnvironmentWhereInput
    orderBy?: EnvironmentOrderByWithRelationInput | EnvironmentOrderByWithRelationInput[]
    cursor?: EnvironmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EnvironmentScalarFieldEnum | EnvironmentScalarFieldEnum[]
  }

  /**
   * Tenant without action
   */
  export type TenantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
  }


  /**
   * Model Environment
   */

  export type AggregateEnvironment = {
    _count: EnvironmentCountAggregateOutputType | null
    _min: EnvironmentMinAggregateOutputType | null
    _max: EnvironmentMaxAggregateOutputType | null
  }

  export type EnvironmentMinAggregateOutputType = {
    tenantId: string | null
    name: string | null
    type: string | null
    status: string | null
    webClientUrl: string | null
    locationName: string | null
    applicationVersion: string | null
    platformVersion: string | null
  }

  export type EnvironmentMaxAggregateOutputType = {
    tenantId: string | null
    name: string | null
    type: string | null
    status: string | null
    webClientUrl: string | null
    locationName: string | null
    applicationVersion: string | null
    platformVersion: string | null
  }

  export type EnvironmentCountAggregateOutputType = {
    tenantId: number
    name: number
    type: number
    status: number
    webClientUrl: number
    locationName: number
    applicationVersion: number
    platformVersion: number
    _all: number
  }


  export type EnvironmentMinAggregateInputType = {
    tenantId?: true
    name?: true
    type?: true
    status?: true
    webClientUrl?: true
    locationName?: true
    applicationVersion?: true
    platformVersion?: true
  }

  export type EnvironmentMaxAggregateInputType = {
    tenantId?: true
    name?: true
    type?: true
    status?: true
    webClientUrl?: true
    locationName?: true
    applicationVersion?: true
    platformVersion?: true
  }

  export type EnvironmentCountAggregateInputType = {
    tenantId?: true
    name?: true
    type?: true
    status?: true
    webClientUrl?: true
    locationName?: true
    applicationVersion?: true
    platformVersion?: true
    _all?: true
  }

  export type EnvironmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Environment to aggregate.
     */
    where?: EnvironmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Environments to fetch.
     */
    orderBy?: EnvironmentOrderByWithRelationInput | EnvironmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EnvironmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Environments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Environments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Environments
    **/
    _count?: true | EnvironmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EnvironmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EnvironmentMaxAggregateInputType
  }

  export type GetEnvironmentAggregateType<T extends EnvironmentAggregateArgs> = {
        [P in keyof T & keyof AggregateEnvironment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEnvironment[P]>
      : GetScalarType<T[P], AggregateEnvironment[P]>
  }




  export type EnvironmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EnvironmentWhereInput
    orderBy?: EnvironmentOrderByWithAggregationInput | EnvironmentOrderByWithAggregationInput[]
    by: EnvironmentScalarFieldEnum[] | EnvironmentScalarFieldEnum
    having?: EnvironmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EnvironmentCountAggregateInputType | true
    _min?: EnvironmentMinAggregateInputType
    _max?: EnvironmentMaxAggregateInputType
  }

  export type EnvironmentGroupByOutputType = {
    tenantId: string
    name: string
    type: string | null
    status: string | null
    webClientUrl: string | null
    locationName: string | null
    applicationVersion: string | null
    platformVersion: string | null
    _count: EnvironmentCountAggregateOutputType | null
    _min: EnvironmentMinAggregateOutputType | null
    _max: EnvironmentMaxAggregateOutputType | null
  }

  type GetEnvironmentGroupByPayload<T extends EnvironmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EnvironmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EnvironmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EnvironmentGroupByOutputType[P]>
            : GetScalarType<T[P], EnvironmentGroupByOutputType[P]>
        }
      >
    >


  export type EnvironmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tenantId?: boolean
    name?: boolean
    type?: boolean
    status?: boolean
    webClientUrl?: boolean
    locationName?: boolean
    applicationVersion?: boolean
    platformVersion?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    extensions?: boolean | Environment$extensionsArgs<ExtArgs>
    _count?: boolean | EnvironmentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["environment"]>

  export type EnvironmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tenantId?: boolean
    name?: boolean
    type?: boolean
    status?: boolean
    webClientUrl?: boolean
    locationName?: boolean
    applicationVersion?: boolean
    platformVersion?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["environment"]>

  export type EnvironmentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tenantId?: boolean
    name?: boolean
    type?: boolean
    status?: boolean
    webClientUrl?: boolean
    locationName?: boolean
    applicationVersion?: boolean
    platformVersion?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["environment"]>

  export type EnvironmentSelectScalar = {
    tenantId?: boolean
    name?: boolean
    type?: boolean
    status?: boolean
    webClientUrl?: boolean
    locationName?: boolean
    applicationVersion?: boolean
    platformVersion?: boolean
  }

  export type EnvironmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"tenantId" | "name" | "type" | "status" | "webClientUrl" | "locationName" | "applicationVersion" | "platformVersion", ExtArgs["result"]["environment"]>
  export type EnvironmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    extensions?: boolean | Environment$extensionsArgs<ExtArgs>
    _count?: boolean | EnvironmentCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type EnvironmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type EnvironmentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $EnvironmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Environment"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      extensions: Prisma.$ExtensionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      tenantId: string
      name: string
      type: string | null
      status: string | null
      webClientUrl: string | null
      locationName: string | null
      applicationVersion: string | null
      platformVersion: string | null
    }, ExtArgs["result"]["environment"]>
    composites: {}
  }

  type EnvironmentGetPayload<S extends boolean | null | undefined | EnvironmentDefaultArgs> = $Result.GetResult<Prisma.$EnvironmentPayload, S>

  type EnvironmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EnvironmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EnvironmentCountAggregateInputType | true
    }

  export interface EnvironmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Environment'], meta: { name: 'Environment' } }
    /**
     * Find zero or one Environment that matches the filter.
     * @param {EnvironmentFindUniqueArgs} args - Arguments to find a Environment
     * @example
     * // Get one Environment
     * const environment = await prisma.environment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EnvironmentFindUniqueArgs>(args: SelectSubset<T, EnvironmentFindUniqueArgs<ExtArgs>>): Prisma__EnvironmentClient<$Result.GetResult<Prisma.$EnvironmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Environment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EnvironmentFindUniqueOrThrowArgs} args - Arguments to find a Environment
     * @example
     * // Get one Environment
     * const environment = await prisma.environment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EnvironmentFindUniqueOrThrowArgs>(args: SelectSubset<T, EnvironmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EnvironmentClient<$Result.GetResult<Prisma.$EnvironmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Environment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EnvironmentFindFirstArgs} args - Arguments to find a Environment
     * @example
     * // Get one Environment
     * const environment = await prisma.environment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EnvironmentFindFirstArgs>(args?: SelectSubset<T, EnvironmentFindFirstArgs<ExtArgs>>): Prisma__EnvironmentClient<$Result.GetResult<Prisma.$EnvironmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Environment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EnvironmentFindFirstOrThrowArgs} args - Arguments to find a Environment
     * @example
     * // Get one Environment
     * const environment = await prisma.environment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EnvironmentFindFirstOrThrowArgs>(args?: SelectSubset<T, EnvironmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__EnvironmentClient<$Result.GetResult<Prisma.$EnvironmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Environments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EnvironmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Environments
     * const environments = await prisma.environment.findMany()
     * 
     * // Get first 10 Environments
     * const environments = await prisma.environment.findMany({ take: 10 })
     * 
     * // Only select the `tenantId`
     * const environmentWithTenantIdOnly = await prisma.environment.findMany({ select: { tenantId: true } })
     * 
     */
    findMany<T extends EnvironmentFindManyArgs>(args?: SelectSubset<T, EnvironmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EnvironmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Environment.
     * @param {EnvironmentCreateArgs} args - Arguments to create a Environment.
     * @example
     * // Create one Environment
     * const Environment = await prisma.environment.create({
     *   data: {
     *     // ... data to create a Environment
     *   }
     * })
     * 
     */
    create<T extends EnvironmentCreateArgs>(args: SelectSubset<T, EnvironmentCreateArgs<ExtArgs>>): Prisma__EnvironmentClient<$Result.GetResult<Prisma.$EnvironmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Environments.
     * @param {EnvironmentCreateManyArgs} args - Arguments to create many Environments.
     * @example
     * // Create many Environments
     * const environment = await prisma.environment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EnvironmentCreateManyArgs>(args?: SelectSubset<T, EnvironmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Environments and returns the data saved in the database.
     * @param {EnvironmentCreateManyAndReturnArgs} args - Arguments to create many Environments.
     * @example
     * // Create many Environments
     * const environment = await prisma.environment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Environments and only return the `tenantId`
     * const environmentWithTenantIdOnly = await prisma.environment.createManyAndReturn({
     *   select: { tenantId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EnvironmentCreateManyAndReturnArgs>(args?: SelectSubset<T, EnvironmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EnvironmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Environment.
     * @param {EnvironmentDeleteArgs} args - Arguments to delete one Environment.
     * @example
     * // Delete one Environment
     * const Environment = await prisma.environment.delete({
     *   where: {
     *     // ... filter to delete one Environment
     *   }
     * })
     * 
     */
    delete<T extends EnvironmentDeleteArgs>(args: SelectSubset<T, EnvironmentDeleteArgs<ExtArgs>>): Prisma__EnvironmentClient<$Result.GetResult<Prisma.$EnvironmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Environment.
     * @param {EnvironmentUpdateArgs} args - Arguments to update one Environment.
     * @example
     * // Update one Environment
     * const environment = await prisma.environment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EnvironmentUpdateArgs>(args: SelectSubset<T, EnvironmentUpdateArgs<ExtArgs>>): Prisma__EnvironmentClient<$Result.GetResult<Prisma.$EnvironmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Environments.
     * @param {EnvironmentDeleteManyArgs} args - Arguments to filter Environments to delete.
     * @example
     * // Delete a few Environments
     * const { count } = await prisma.environment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EnvironmentDeleteManyArgs>(args?: SelectSubset<T, EnvironmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Environments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EnvironmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Environments
     * const environment = await prisma.environment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EnvironmentUpdateManyArgs>(args: SelectSubset<T, EnvironmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Environments and returns the data updated in the database.
     * @param {EnvironmentUpdateManyAndReturnArgs} args - Arguments to update many Environments.
     * @example
     * // Update many Environments
     * const environment = await prisma.environment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Environments and only return the `tenantId`
     * const environmentWithTenantIdOnly = await prisma.environment.updateManyAndReturn({
     *   select: { tenantId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends EnvironmentUpdateManyAndReturnArgs>(args: SelectSubset<T, EnvironmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EnvironmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Environment.
     * @param {EnvironmentUpsertArgs} args - Arguments to update or create a Environment.
     * @example
     * // Update or create a Environment
     * const environment = await prisma.environment.upsert({
     *   create: {
     *     // ... data to create a Environment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Environment we want to update
     *   }
     * })
     */
    upsert<T extends EnvironmentUpsertArgs>(args: SelectSubset<T, EnvironmentUpsertArgs<ExtArgs>>): Prisma__EnvironmentClient<$Result.GetResult<Prisma.$EnvironmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Environments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EnvironmentCountArgs} args - Arguments to filter Environments to count.
     * @example
     * // Count the number of Environments
     * const count = await prisma.environment.count({
     *   where: {
     *     // ... the filter for the Environments we want to count
     *   }
     * })
    **/
    count<T extends EnvironmentCountArgs>(
      args?: Subset<T, EnvironmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EnvironmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Environment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EnvironmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EnvironmentAggregateArgs>(args: Subset<T, EnvironmentAggregateArgs>): Prisma.PrismaPromise<GetEnvironmentAggregateType<T>>

    /**
     * Group by Environment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EnvironmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EnvironmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EnvironmentGroupByArgs['orderBy'] }
        : { orderBy?: EnvironmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EnvironmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEnvironmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Environment model
   */
  readonly fields: EnvironmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Environment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EnvironmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    extensions<T extends Environment$extensionsArgs<ExtArgs> = {}>(args?: Subset<T, Environment$extensionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExtensionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Environment model
   */
  interface EnvironmentFieldRefs {
    readonly tenantId: FieldRef<"Environment", 'String'>
    readonly name: FieldRef<"Environment", 'String'>
    readonly type: FieldRef<"Environment", 'String'>
    readonly status: FieldRef<"Environment", 'String'>
    readonly webClientUrl: FieldRef<"Environment", 'String'>
    readonly locationName: FieldRef<"Environment", 'String'>
    readonly applicationVersion: FieldRef<"Environment", 'String'>
    readonly platformVersion: FieldRef<"Environment", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Environment findUnique
   */
  export type EnvironmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Environment
     */
    select?: EnvironmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Environment
     */
    omit?: EnvironmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnvironmentInclude<ExtArgs> | null
    /**
     * Filter, which Environment to fetch.
     */
    where: EnvironmentWhereUniqueInput
  }

  /**
   * Environment findUniqueOrThrow
   */
  export type EnvironmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Environment
     */
    select?: EnvironmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Environment
     */
    omit?: EnvironmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnvironmentInclude<ExtArgs> | null
    /**
     * Filter, which Environment to fetch.
     */
    where: EnvironmentWhereUniqueInput
  }

  /**
   * Environment findFirst
   */
  export type EnvironmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Environment
     */
    select?: EnvironmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Environment
     */
    omit?: EnvironmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnvironmentInclude<ExtArgs> | null
    /**
     * Filter, which Environment to fetch.
     */
    where?: EnvironmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Environments to fetch.
     */
    orderBy?: EnvironmentOrderByWithRelationInput | EnvironmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Environments.
     */
    cursor?: EnvironmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Environments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Environments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Environments.
     */
    distinct?: EnvironmentScalarFieldEnum | EnvironmentScalarFieldEnum[]
  }

  /**
   * Environment findFirstOrThrow
   */
  export type EnvironmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Environment
     */
    select?: EnvironmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Environment
     */
    omit?: EnvironmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnvironmentInclude<ExtArgs> | null
    /**
     * Filter, which Environment to fetch.
     */
    where?: EnvironmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Environments to fetch.
     */
    orderBy?: EnvironmentOrderByWithRelationInput | EnvironmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Environments.
     */
    cursor?: EnvironmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Environments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Environments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Environments.
     */
    distinct?: EnvironmentScalarFieldEnum | EnvironmentScalarFieldEnum[]
  }

  /**
   * Environment findMany
   */
  export type EnvironmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Environment
     */
    select?: EnvironmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Environment
     */
    omit?: EnvironmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnvironmentInclude<ExtArgs> | null
    /**
     * Filter, which Environments to fetch.
     */
    where?: EnvironmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Environments to fetch.
     */
    orderBy?: EnvironmentOrderByWithRelationInput | EnvironmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Environments.
     */
    cursor?: EnvironmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Environments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Environments.
     */
    skip?: number
    distinct?: EnvironmentScalarFieldEnum | EnvironmentScalarFieldEnum[]
  }

  /**
   * Environment create
   */
  export type EnvironmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Environment
     */
    select?: EnvironmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Environment
     */
    omit?: EnvironmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnvironmentInclude<ExtArgs> | null
    /**
     * The data needed to create a Environment.
     */
    data: XOR<EnvironmentCreateInput, EnvironmentUncheckedCreateInput>
  }

  /**
   * Environment createMany
   */
  export type EnvironmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Environments.
     */
    data: EnvironmentCreateManyInput | EnvironmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Environment createManyAndReturn
   */
  export type EnvironmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Environment
     */
    select?: EnvironmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Environment
     */
    omit?: EnvironmentOmit<ExtArgs> | null
    /**
     * The data used to create many Environments.
     */
    data: EnvironmentCreateManyInput | EnvironmentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnvironmentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Environment update
   */
  export type EnvironmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Environment
     */
    select?: EnvironmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Environment
     */
    omit?: EnvironmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnvironmentInclude<ExtArgs> | null
    /**
     * The data needed to update a Environment.
     */
    data: XOR<EnvironmentUpdateInput, EnvironmentUncheckedUpdateInput>
    /**
     * Choose, which Environment to update.
     */
    where: EnvironmentWhereUniqueInput
  }

  /**
   * Environment updateMany
   */
  export type EnvironmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Environments.
     */
    data: XOR<EnvironmentUpdateManyMutationInput, EnvironmentUncheckedUpdateManyInput>
    /**
     * Filter which Environments to update
     */
    where?: EnvironmentWhereInput
    /**
     * Limit how many Environments to update.
     */
    limit?: number
  }

  /**
   * Environment updateManyAndReturn
   */
  export type EnvironmentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Environment
     */
    select?: EnvironmentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Environment
     */
    omit?: EnvironmentOmit<ExtArgs> | null
    /**
     * The data used to update Environments.
     */
    data: XOR<EnvironmentUpdateManyMutationInput, EnvironmentUncheckedUpdateManyInput>
    /**
     * Filter which Environments to update
     */
    where?: EnvironmentWhereInput
    /**
     * Limit how many Environments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnvironmentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Environment upsert
   */
  export type EnvironmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Environment
     */
    select?: EnvironmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Environment
     */
    omit?: EnvironmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnvironmentInclude<ExtArgs> | null
    /**
     * The filter to search for the Environment to update in case it exists.
     */
    where: EnvironmentWhereUniqueInput
    /**
     * In case the Environment found by the `where` argument doesn't exist, create a new Environment with this data.
     */
    create: XOR<EnvironmentCreateInput, EnvironmentUncheckedCreateInput>
    /**
     * In case the Environment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EnvironmentUpdateInput, EnvironmentUncheckedUpdateInput>
  }

  /**
   * Environment delete
   */
  export type EnvironmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Environment
     */
    select?: EnvironmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Environment
     */
    omit?: EnvironmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnvironmentInclude<ExtArgs> | null
    /**
     * Filter which Environment to delete.
     */
    where: EnvironmentWhereUniqueInput
  }

  /**
   * Environment deleteMany
   */
  export type EnvironmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Environments to delete
     */
    where?: EnvironmentWhereInput
    /**
     * Limit how many Environments to delete.
     */
    limit?: number
  }

  /**
   * Environment.extensions
   */
  export type Environment$extensionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Extension
     */
    select?: ExtensionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Extension
     */
    omit?: ExtensionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExtensionInclude<ExtArgs> | null
    where?: ExtensionWhereInput
    orderBy?: ExtensionOrderByWithRelationInput | ExtensionOrderByWithRelationInput[]
    cursor?: ExtensionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ExtensionScalarFieldEnum | ExtensionScalarFieldEnum[]
  }

  /**
   * Environment without action
   */
  export type EnvironmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Environment
     */
    select?: EnvironmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Environment
     */
    omit?: EnvironmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EnvironmentInclude<ExtArgs> | null
  }


  /**
   * Model Extension
   */

  export type AggregateExtension = {
    _count: ExtensionCountAggregateOutputType | null
    _min: ExtensionMinAggregateOutputType | null
    _max: ExtensionMaxAggregateOutputType | null
  }

  export type ExtensionMinAggregateOutputType = {
    tenantId: string | null
    environmentName: string | null
    id: string | null
    name: string | null
    version: string | null
    publisher: string | null
    publishedAs: string | null
    state: string | null
  }

  export type ExtensionMaxAggregateOutputType = {
    tenantId: string | null
    environmentName: string | null
    id: string | null
    name: string | null
    version: string | null
    publisher: string | null
    publishedAs: string | null
    state: string | null
  }

  export type ExtensionCountAggregateOutputType = {
    tenantId: number
    environmentName: number
    id: number
    name: number
    version: number
    publisher: number
    publishedAs: number
    state: number
    _all: number
  }


  export type ExtensionMinAggregateInputType = {
    tenantId?: true
    environmentName?: true
    id?: true
    name?: true
    version?: true
    publisher?: true
    publishedAs?: true
    state?: true
  }

  export type ExtensionMaxAggregateInputType = {
    tenantId?: true
    environmentName?: true
    id?: true
    name?: true
    version?: true
    publisher?: true
    publishedAs?: true
    state?: true
  }

  export type ExtensionCountAggregateInputType = {
    tenantId?: true
    environmentName?: true
    id?: true
    name?: true
    version?: true
    publisher?: true
    publishedAs?: true
    state?: true
    _all?: true
  }

  export type ExtensionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Extension to aggregate.
     */
    where?: ExtensionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Extensions to fetch.
     */
    orderBy?: ExtensionOrderByWithRelationInput | ExtensionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ExtensionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Extensions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Extensions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Extensions
    **/
    _count?: true | ExtensionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ExtensionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ExtensionMaxAggregateInputType
  }

  export type GetExtensionAggregateType<T extends ExtensionAggregateArgs> = {
        [P in keyof T & keyof AggregateExtension]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExtension[P]>
      : GetScalarType<T[P], AggregateExtension[P]>
  }




  export type ExtensionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExtensionWhereInput
    orderBy?: ExtensionOrderByWithAggregationInput | ExtensionOrderByWithAggregationInput[]
    by: ExtensionScalarFieldEnum[] | ExtensionScalarFieldEnum
    having?: ExtensionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ExtensionCountAggregateInputType | true
    _min?: ExtensionMinAggregateInputType
    _max?: ExtensionMaxAggregateInputType
  }

  export type ExtensionGroupByOutputType = {
    tenantId: string
    environmentName: string
    id: string
    name: string
    version: string
    publisher: string
    publishedAs: string
    state: string | null
    _count: ExtensionCountAggregateOutputType | null
    _min: ExtensionMinAggregateOutputType | null
    _max: ExtensionMaxAggregateOutputType | null
  }

  type GetExtensionGroupByPayload<T extends ExtensionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ExtensionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ExtensionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ExtensionGroupByOutputType[P]>
            : GetScalarType<T[P], ExtensionGroupByOutputType[P]>
        }
      >
    >


  export type ExtensionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tenantId?: boolean
    environmentName?: boolean
    id?: boolean
    name?: boolean
    version?: boolean
    publisher?: boolean
    publishedAs?: boolean
    state?: boolean
    environment?: boolean | EnvironmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["extension"]>

  export type ExtensionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tenantId?: boolean
    environmentName?: boolean
    id?: boolean
    name?: boolean
    version?: boolean
    publisher?: boolean
    publishedAs?: boolean
    state?: boolean
    environment?: boolean | EnvironmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["extension"]>

  export type ExtensionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tenantId?: boolean
    environmentName?: boolean
    id?: boolean
    name?: boolean
    version?: boolean
    publisher?: boolean
    publishedAs?: boolean
    state?: boolean
    environment?: boolean | EnvironmentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["extension"]>

  export type ExtensionSelectScalar = {
    tenantId?: boolean
    environmentName?: boolean
    id?: boolean
    name?: boolean
    version?: boolean
    publisher?: boolean
    publishedAs?: boolean
    state?: boolean
  }

  export type ExtensionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"tenantId" | "environmentName" | "id" | "name" | "version" | "publisher" | "publishedAs" | "state", ExtArgs["result"]["extension"]>
  export type ExtensionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    environment?: boolean | EnvironmentDefaultArgs<ExtArgs>
  }
  export type ExtensionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    environment?: boolean | EnvironmentDefaultArgs<ExtArgs>
  }
  export type ExtensionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    environment?: boolean | EnvironmentDefaultArgs<ExtArgs>
  }

  export type $ExtensionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Extension"
    objects: {
      environment: Prisma.$EnvironmentPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      tenantId: string
      environmentName: string
      id: string
      name: string
      version: string
      publisher: string
      publishedAs: string
      state: string | null
    }, ExtArgs["result"]["extension"]>
    composites: {}
  }

  type ExtensionGetPayload<S extends boolean | null | undefined | ExtensionDefaultArgs> = $Result.GetResult<Prisma.$ExtensionPayload, S>

  type ExtensionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ExtensionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ExtensionCountAggregateInputType | true
    }

  export interface ExtensionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Extension'], meta: { name: 'Extension' } }
    /**
     * Find zero or one Extension that matches the filter.
     * @param {ExtensionFindUniqueArgs} args - Arguments to find a Extension
     * @example
     * // Get one Extension
     * const extension = await prisma.extension.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExtensionFindUniqueArgs>(args: SelectSubset<T, ExtensionFindUniqueArgs<ExtArgs>>): Prisma__ExtensionClient<$Result.GetResult<Prisma.$ExtensionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Extension that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ExtensionFindUniqueOrThrowArgs} args - Arguments to find a Extension
     * @example
     * // Get one Extension
     * const extension = await prisma.extension.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExtensionFindUniqueOrThrowArgs>(args: SelectSubset<T, ExtensionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ExtensionClient<$Result.GetResult<Prisma.$ExtensionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Extension that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExtensionFindFirstArgs} args - Arguments to find a Extension
     * @example
     * // Get one Extension
     * const extension = await prisma.extension.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExtensionFindFirstArgs>(args?: SelectSubset<T, ExtensionFindFirstArgs<ExtArgs>>): Prisma__ExtensionClient<$Result.GetResult<Prisma.$ExtensionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Extension that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExtensionFindFirstOrThrowArgs} args - Arguments to find a Extension
     * @example
     * // Get one Extension
     * const extension = await prisma.extension.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExtensionFindFirstOrThrowArgs>(args?: SelectSubset<T, ExtensionFindFirstOrThrowArgs<ExtArgs>>): Prisma__ExtensionClient<$Result.GetResult<Prisma.$ExtensionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Extensions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExtensionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Extensions
     * const extensions = await prisma.extension.findMany()
     * 
     * // Get first 10 Extensions
     * const extensions = await prisma.extension.findMany({ take: 10 })
     * 
     * // Only select the `tenantId`
     * const extensionWithTenantIdOnly = await prisma.extension.findMany({ select: { tenantId: true } })
     * 
     */
    findMany<T extends ExtensionFindManyArgs>(args?: SelectSubset<T, ExtensionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExtensionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Extension.
     * @param {ExtensionCreateArgs} args - Arguments to create a Extension.
     * @example
     * // Create one Extension
     * const Extension = await prisma.extension.create({
     *   data: {
     *     // ... data to create a Extension
     *   }
     * })
     * 
     */
    create<T extends ExtensionCreateArgs>(args: SelectSubset<T, ExtensionCreateArgs<ExtArgs>>): Prisma__ExtensionClient<$Result.GetResult<Prisma.$ExtensionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Extensions.
     * @param {ExtensionCreateManyArgs} args - Arguments to create many Extensions.
     * @example
     * // Create many Extensions
     * const extension = await prisma.extension.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ExtensionCreateManyArgs>(args?: SelectSubset<T, ExtensionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Extensions and returns the data saved in the database.
     * @param {ExtensionCreateManyAndReturnArgs} args - Arguments to create many Extensions.
     * @example
     * // Create many Extensions
     * const extension = await prisma.extension.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Extensions and only return the `tenantId`
     * const extensionWithTenantIdOnly = await prisma.extension.createManyAndReturn({
     *   select: { tenantId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ExtensionCreateManyAndReturnArgs>(args?: SelectSubset<T, ExtensionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExtensionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Extension.
     * @param {ExtensionDeleteArgs} args - Arguments to delete one Extension.
     * @example
     * // Delete one Extension
     * const Extension = await prisma.extension.delete({
     *   where: {
     *     // ... filter to delete one Extension
     *   }
     * })
     * 
     */
    delete<T extends ExtensionDeleteArgs>(args: SelectSubset<T, ExtensionDeleteArgs<ExtArgs>>): Prisma__ExtensionClient<$Result.GetResult<Prisma.$ExtensionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Extension.
     * @param {ExtensionUpdateArgs} args - Arguments to update one Extension.
     * @example
     * // Update one Extension
     * const extension = await prisma.extension.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ExtensionUpdateArgs>(args: SelectSubset<T, ExtensionUpdateArgs<ExtArgs>>): Prisma__ExtensionClient<$Result.GetResult<Prisma.$ExtensionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Extensions.
     * @param {ExtensionDeleteManyArgs} args - Arguments to filter Extensions to delete.
     * @example
     * // Delete a few Extensions
     * const { count } = await prisma.extension.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ExtensionDeleteManyArgs>(args?: SelectSubset<T, ExtensionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Extensions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExtensionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Extensions
     * const extension = await prisma.extension.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ExtensionUpdateManyArgs>(args: SelectSubset<T, ExtensionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Extensions and returns the data updated in the database.
     * @param {ExtensionUpdateManyAndReturnArgs} args - Arguments to update many Extensions.
     * @example
     * // Update many Extensions
     * const extension = await prisma.extension.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Extensions and only return the `tenantId`
     * const extensionWithTenantIdOnly = await prisma.extension.updateManyAndReturn({
     *   select: { tenantId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ExtensionUpdateManyAndReturnArgs>(args: SelectSubset<T, ExtensionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExtensionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Extension.
     * @param {ExtensionUpsertArgs} args - Arguments to update or create a Extension.
     * @example
     * // Update or create a Extension
     * const extension = await prisma.extension.upsert({
     *   create: {
     *     // ... data to create a Extension
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Extension we want to update
     *   }
     * })
     */
    upsert<T extends ExtensionUpsertArgs>(args: SelectSubset<T, ExtensionUpsertArgs<ExtArgs>>): Prisma__ExtensionClient<$Result.GetResult<Prisma.$ExtensionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Extensions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExtensionCountArgs} args - Arguments to filter Extensions to count.
     * @example
     * // Count the number of Extensions
     * const count = await prisma.extension.count({
     *   where: {
     *     // ... the filter for the Extensions we want to count
     *   }
     * })
    **/
    count<T extends ExtensionCountArgs>(
      args?: Subset<T, ExtensionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ExtensionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Extension.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExtensionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ExtensionAggregateArgs>(args: Subset<T, ExtensionAggregateArgs>): Prisma.PrismaPromise<GetExtensionAggregateType<T>>

    /**
     * Group by Extension.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExtensionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ExtensionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ExtensionGroupByArgs['orderBy'] }
        : { orderBy?: ExtensionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ExtensionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExtensionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Extension model
   */
  readonly fields: ExtensionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Extension.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ExtensionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    environment<T extends EnvironmentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EnvironmentDefaultArgs<ExtArgs>>): Prisma__EnvironmentClient<$Result.GetResult<Prisma.$EnvironmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Extension model
   */
  interface ExtensionFieldRefs {
    readonly tenantId: FieldRef<"Extension", 'String'>
    readonly environmentName: FieldRef<"Extension", 'String'>
    readonly id: FieldRef<"Extension", 'String'>
    readonly name: FieldRef<"Extension", 'String'>
    readonly version: FieldRef<"Extension", 'String'>
    readonly publisher: FieldRef<"Extension", 'String'>
    readonly publishedAs: FieldRef<"Extension", 'String'>
    readonly state: FieldRef<"Extension", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Extension findUnique
   */
  export type ExtensionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Extension
     */
    select?: ExtensionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Extension
     */
    omit?: ExtensionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExtensionInclude<ExtArgs> | null
    /**
     * Filter, which Extension to fetch.
     */
    where: ExtensionWhereUniqueInput
  }

  /**
   * Extension findUniqueOrThrow
   */
  export type ExtensionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Extension
     */
    select?: ExtensionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Extension
     */
    omit?: ExtensionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExtensionInclude<ExtArgs> | null
    /**
     * Filter, which Extension to fetch.
     */
    where: ExtensionWhereUniqueInput
  }

  /**
   * Extension findFirst
   */
  export type ExtensionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Extension
     */
    select?: ExtensionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Extension
     */
    omit?: ExtensionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExtensionInclude<ExtArgs> | null
    /**
     * Filter, which Extension to fetch.
     */
    where?: ExtensionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Extensions to fetch.
     */
    orderBy?: ExtensionOrderByWithRelationInput | ExtensionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Extensions.
     */
    cursor?: ExtensionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Extensions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Extensions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Extensions.
     */
    distinct?: ExtensionScalarFieldEnum | ExtensionScalarFieldEnum[]
  }

  /**
   * Extension findFirstOrThrow
   */
  export type ExtensionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Extension
     */
    select?: ExtensionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Extension
     */
    omit?: ExtensionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExtensionInclude<ExtArgs> | null
    /**
     * Filter, which Extension to fetch.
     */
    where?: ExtensionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Extensions to fetch.
     */
    orderBy?: ExtensionOrderByWithRelationInput | ExtensionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Extensions.
     */
    cursor?: ExtensionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Extensions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Extensions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Extensions.
     */
    distinct?: ExtensionScalarFieldEnum | ExtensionScalarFieldEnum[]
  }

  /**
   * Extension findMany
   */
  export type ExtensionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Extension
     */
    select?: ExtensionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Extension
     */
    omit?: ExtensionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExtensionInclude<ExtArgs> | null
    /**
     * Filter, which Extensions to fetch.
     */
    where?: ExtensionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Extensions to fetch.
     */
    orderBy?: ExtensionOrderByWithRelationInput | ExtensionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Extensions.
     */
    cursor?: ExtensionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Extensions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Extensions.
     */
    skip?: number
    distinct?: ExtensionScalarFieldEnum | ExtensionScalarFieldEnum[]
  }

  /**
   * Extension create
   */
  export type ExtensionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Extension
     */
    select?: ExtensionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Extension
     */
    omit?: ExtensionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExtensionInclude<ExtArgs> | null
    /**
     * The data needed to create a Extension.
     */
    data: XOR<ExtensionCreateInput, ExtensionUncheckedCreateInput>
  }

  /**
   * Extension createMany
   */
  export type ExtensionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Extensions.
     */
    data: ExtensionCreateManyInput | ExtensionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Extension createManyAndReturn
   */
  export type ExtensionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Extension
     */
    select?: ExtensionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Extension
     */
    omit?: ExtensionOmit<ExtArgs> | null
    /**
     * The data used to create many Extensions.
     */
    data: ExtensionCreateManyInput | ExtensionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExtensionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Extension update
   */
  export type ExtensionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Extension
     */
    select?: ExtensionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Extension
     */
    omit?: ExtensionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExtensionInclude<ExtArgs> | null
    /**
     * The data needed to update a Extension.
     */
    data: XOR<ExtensionUpdateInput, ExtensionUncheckedUpdateInput>
    /**
     * Choose, which Extension to update.
     */
    where: ExtensionWhereUniqueInput
  }

  /**
   * Extension updateMany
   */
  export type ExtensionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Extensions.
     */
    data: XOR<ExtensionUpdateManyMutationInput, ExtensionUncheckedUpdateManyInput>
    /**
     * Filter which Extensions to update
     */
    where?: ExtensionWhereInput
    /**
     * Limit how many Extensions to update.
     */
    limit?: number
  }

  /**
   * Extension updateManyAndReturn
   */
  export type ExtensionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Extension
     */
    select?: ExtensionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Extension
     */
    omit?: ExtensionOmit<ExtArgs> | null
    /**
     * The data used to update Extensions.
     */
    data: XOR<ExtensionUpdateManyMutationInput, ExtensionUncheckedUpdateManyInput>
    /**
     * Filter which Extensions to update
     */
    where?: ExtensionWhereInput
    /**
     * Limit how many Extensions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExtensionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Extension upsert
   */
  export type ExtensionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Extension
     */
    select?: ExtensionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Extension
     */
    omit?: ExtensionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExtensionInclude<ExtArgs> | null
    /**
     * The filter to search for the Extension to update in case it exists.
     */
    where: ExtensionWhereUniqueInput
    /**
     * In case the Extension found by the `where` argument doesn't exist, create a new Extension with this data.
     */
    create: XOR<ExtensionCreateInput, ExtensionUncheckedCreateInput>
    /**
     * In case the Extension was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ExtensionUpdateInput, ExtensionUncheckedUpdateInput>
  }

  /**
   * Extension delete
   */
  export type ExtensionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Extension
     */
    select?: ExtensionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Extension
     */
    omit?: ExtensionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExtensionInclude<ExtArgs> | null
    /**
     * Filter which Extension to delete.
     */
    where: ExtensionWhereUniqueInput
  }

  /**
   * Extension deleteMany
   */
  export type ExtensionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Extensions to delete
     */
    where?: ExtensionWhereInput
    /**
     * Limit how many Extensions to delete.
     */
    limit?: number
  }

  /**
   * Extension without action
   */
  export type ExtensionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Extension
     */
    select?: ExtensionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Extension
     */
    omit?: ExtensionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExtensionInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    password: 'password',
    role: 'role',
    githubToken: 'githubToken',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const CustomerScalarFieldEnum: {
    id: 'id',
    customerName: 'customerName',
    imageBase64: 'imageBase64'
  };

  export type CustomerScalarFieldEnum = (typeof CustomerScalarFieldEnum)[keyof typeof CustomerScalarFieldEnum]


  export const UserCustomerScalarFieldEnum: {
    userId: 'userId',
    customerId: 'customerId',
    assignedAt: 'assignedAt'
  };

  export type UserCustomerScalarFieldEnum = (typeof UserCustomerScalarFieldEnum)[keyof typeof UserCustomerScalarFieldEnum]


  export const TenantScalarFieldEnum: {
    id: 'id',
    customerId: 'customerId',
    description: 'description',
    createdAt: 'createdAt',
    modifiedAt: 'modifiedAt',
    connectionId: 'connectionId',
    grantType: 'grantType',
    clientId: 'clientId',
    clientSecret: 'clientSecret',
    scope: 'scope',
    token: 'token',
    tokenExpiresAt: 'tokenExpiresAt'
  };

  export type TenantScalarFieldEnum = (typeof TenantScalarFieldEnum)[keyof typeof TenantScalarFieldEnum]


  export const EnvironmentScalarFieldEnum: {
    tenantId: 'tenantId',
    name: 'name',
    type: 'type',
    status: 'status',
    webClientUrl: 'webClientUrl',
    locationName: 'locationName',
    applicationVersion: 'applicationVersion',
    platformVersion: 'platformVersion'
  };

  export type EnvironmentScalarFieldEnum = (typeof EnvironmentScalarFieldEnum)[keyof typeof EnvironmentScalarFieldEnum]


  export const ExtensionScalarFieldEnum: {
    tenantId: 'tenantId',
    environmentName: 'environmentName',
    id: 'id',
    name: 'name',
    version: 'version',
    publisher: 'publisher',
    publishedAs: 'publishedAs',
    state: 'state'
  };

  export type ExtensionScalarFieldEnum = (typeof ExtensionScalarFieldEnum)[keyof typeof ExtensionScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: UuidFilter<"User"> | string
    name?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    githubToken?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    allowedCustomers?: UserCustomerListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    githubToken?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    allowedCustomers?: UserCustomerOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    githubToken?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    allowedCustomers?: UserCustomerListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    githubToken?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    role?: EnumRoleWithAggregatesFilter<"User"> | $Enums.Role
    githubToken?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type CustomerWhereInput = {
    AND?: CustomerWhereInput | CustomerWhereInput[]
    OR?: CustomerWhereInput[]
    NOT?: CustomerWhereInput | CustomerWhereInput[]
    id?: UuidFilter<"Customer"> | string
    customerName?: StringFilter<"Customer"> | string
    imageBase64?: StringNullableFilter<"Customer"> | string | null
    tenants?: TenantListRelationFilter
    allowedUsers?: UserCustomerListRelationFilter
  }

  export type CustomerOrderByWithRelationInput = {
    id?: SortOrder
    customerName?: SortOrder
    imageBase64?: SortOrderInput | SortOrder
    tenants?: TenantOrderByRelationAggregateInput
    allowedUsers?: UserCustomerOrderByRelationAggregateInput
  }

  export type CustomerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CustomerWhereInput | CustomerWhereInput[]
    OR?: CustomerWhereInput[]
    NOT?: CustomerWhereInput | CustomerWhereInput[]
    customerName?: StringFilter<"Customer"> | string
    imageBase64?: StringNullableFilter<"Customer"> | string | null
    tenants?: TenantListRelationFilter
    allowedUsers?: UserCustomerListRelationFilter
  }, "id">

  export type CustomerOrderByWithAggregationInput = {
    id?: SortOrder
    customerName?: SortOrder
    imageBase64?: SortOrderInput | SortOrder
    _count?: CustomerCountOrderByAggregateInput
    _max?: CustomerMaxOrderByAggregateInput
    _min?: CustomerMinOrderByAggregateInput
  }

  export type CustomerScalarWhereWithAggregatesInput = {
    AND?: CustomerScalarWhereWithAggregatesInput | CustomerScalarWhereWithAggregatesInput[]
    OR?: CustomerScalarWhereWithAggregatesInput[]
    NOT?: CustomerScalarWhereWithAggregatesInput | CustomerScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Customer"> | string
    customerName?: StringWithAggregatesFilter<"Customer"> | string
    imageBase64?: StringNullableWithAggregatesFilter<"Customer"> | string | null
  }

  export type UserCustomerWhereInput = {
    AND?: UserCustomerWhereInput | UserCustomerWhereInput[]
    OR?: UserCustomerWhereInput[]
    NOT?: UserCustomerWhereInput | UserCustomerWhereInput[]
    userId?: UuidFilter<"UserCustomer"> | string
    customerId?: UuidFilter<"UserCustomer"> | string
    assignedAt?: DateTimeFilter<"UserCustomer"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    customer?: XOR<CustomerScalarRelationFilter, CustomerWhereInput>
  }

  export type UserCustomerOrderByWithRelationInput = {
    userId?: SortOrder
    customerId?: SortOrder
    assignedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    customer?: CustomerOrderByWithRelationInput
  }

  export type UserCustomerWhereUniqueInput = Prisma.AtLeast<{
    userId_customerId?: UserCustomerUserIdCustomerIdCompoundUniqueInput
    AND?: UserCustomerWhereInput | UserCustomerWhereInput[]
    OR?: UserCustomerWhereInput[]
    NOT?: UserCustomerWhereInput | UserCustomerWhereInput[]
    userId?: UuidFilter<"UserCustomer"> | string
    customerId?: UuidFilter<"UserCustomer"> | string
    assignedAt?: DateTimeFilter<"UserCustomer"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    customer?: XOR<CustomerScalarRelationFilter, CustomerWhereInput>
  }, "userId_customerId">

  export type UserCustomerOrderByWithAggregationInput = {
    userId?: SortOrder
    customerId?: SortOrder
    assignedAt?: SortOrder
    _count?: UserCustomerCountOrderByAggregateInput
    _max?: UserCustomerMaxOrderByAggregateInput
    _min?: UserCustomerMinOrderByAggregateInput
  }

  export type UserCustomerScalarWhereWithAggregatesInput = {
    AND?: UserCustomerScalarWhereWithAggregatesInput | UserCustomerScalarWhereWithAggregatesInput[]
    OR?: UserCustomerScalarWhereWithAggregatesInput[]
    NOT?: UserCustomerScalarWhereWithAggregatesInput | UserCustomerScalarWhereWithAggregatesInput[]
    userId?: UuidWithAggregatesFilter<"UserCustomer"> | string
    customerId?: UuidWithAggregatesFilter<"UserCustomer"> | string
    assignedAt?: DateTimeWithAggregatesFilter<"UserCustomer"> | Date | string
  }

  export type TenantWhereInput = {
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    id?: UuidFilter<"Tenant"> | string
    customerId?: UuidFilter<"Tenant"> | string
    description?: StringNullableFilter<"Tenant"> | string | null
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    modifiedAt?: DateTimeFilter<"Tenant"> | Date | string
    connectionId?: UuidNullableFilter<"Tenant"> | string | null
    grantType?: StringNullableFilter<"Tenant"> | string | null
    clientId?: UuidNullableFilter<"Tenant"> | string | null
    clientSecret?: StringNullableFilter<"Tenant"> | string | null
    scope?: StringNullableFilter<"Tenant"> | string | null
    token?: StringNullableFilter<"Tenant"> | string | null
    tokenExpiresAt?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    customer?: XOR<CustomerScalarRelationFilter, CustomerWhereInput>
    environments?: EnvironmentListRelationFilter
  }

  export type TenantOrderByWithRelationInput = {
    id?: SortOrder
    customerId?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    modifiedAt?: SortOrder
    connectionId?: SortOrderInput | SortOrder
    grantType?: SortOrderInput | SortOrder
    clientId?: SortOrderInput | SortOrder
    clientSecret?: SortOrderInput | SortOrder
    scope?: SortOrderInput | SortOrder
    token?: SortOrderInput | SortOrder
    tokenExpiresAt?: SortOrderInput | SortOrder
    customer?: CustomerOrderByWithRelationInput
    environments?: EnvironmentOrderByRelationAggregateInput
  }

  export type TenantWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    customerId?: UuidFilter<"Tenant"> | string
    description?: StringNullableFilter<"Tenant"> | string | null
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    modifiedAt?: DateTimeFilter<"Tenant"> | Date | string
    connectionId?: UuidNullableFilter<"Tenant"> | string | null
    grantType?: StringNullableFilter<"Tenant"> | string | null
    clientId?: UuidNullableFilter<"Tenant"> | string | null
    clientSecret?: StringNullableFilter<"Tenant"> | string | null
    scope?: StringNullableFilter<"Tenant"> | string | null
    token?: StringNullableFilter<"Tenant"> | string | null
    tokenExpiresAt?: DateTimeNullableFilter<"Tenant"> | Date | string | null
    customer?: XOR<CustomerScalarRelationFilter, CustomerWhereInput>
    environments?: EnvironmentListRelationFilter
  }, "id">

  export type TenantOrderByWithAggregationInput = {
    id?: SortOrder
    customerId?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    modifiedAt?: SortOrder
    connectionId?: SortOrderInput | SortOrder
    grantType?: SortOrderInput | SortOrder
    clientId?: SortOrderInput | SortOrder
    clientSecret?: SortOrderInput | SortOrder
    scope?: SortOrderInput | SortOrder
    token?: SortOrderInput | SortOrder
    tokenExpiresAt?: SortOrderInput | SortOrder
    _count?: TenantCountOrderByAggregateInput
    _max?: TenantMaxOrderByAggregateInput
    _min?: TenantMinOrderByAggregateInput
  }

  export type TenantScalarWhereWithAggregatesInput = {
    AND?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    OR?: TenantScalarWhereWithAggregatesInput[]
    NOT?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Tenant"> | string
    customerId?: UuidWithAggregatesFilter<"Tenant"> | string
    description?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
    modifiedAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
    connectionId?: UuidNullableWithAggregatesFilter<"Tenant"> | string | null
    grantType?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    clientId?: UuidNullableWithAggregatesFilter<"Tenant"> | string | null
    clientSecret?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    scope?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    token?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    tokenExpiresAt?: DateTimeNullableWithAggregatesFilter<"Tenant"> | Date | string | null
  }

  export type EnvironmentWhereInput = {
    AND?: EnvironmentWhereInput | EnvironmentWhereInput[]
    OR?: EnvironmentWhereInput[]
    NOT?: EnvironmentWhereInput | EnvironmentWhereInput[]
    tenantId?: UuidFilter<"Environment"> | string
    name?: StringFilter<"Environment"> | string
    type?: StringNullableFilter<"Environment"> | string | null
    status?: StringNullableFilter<"Environment"> | string | null
    webClientUrl?: StringNullableFilter<"Environment"> | string | null
    locationName?: StringNullableFilter<"Environment"> | string | null
    applicationVersion?: StringNullableFilter<"Environment"> | string | null
    platformVersion?: StringNullableFilter<"Environment"> | string | null
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
    extensions?: ExtensionListRelationFilter
  }

  export type EnvironmentOrderByWithRelationInput = {
    tenantId?: SortOrder
    name?: SortOrder
    type?: SortOrderInput | SortOrder
    status?: SortOrderInput | SortOrder
    webClientUrl?: SortOrderInput | SortOrder
    locationName?: SortOrderInput | SortOrder
    applicationVersion?: SortOrderInput | SortOrder
    platformVersion?: SortOrderInput | SortOrder
    tenant?: TenantOrderByWithRelationInput
    extensions?: ExtensionOrderByRelationAggregateInput
  }

  export type EnvironmentWhereUniqueInput = Prisma.AtLeast<{
    tenantId_name?: EnvironmentTenantIdNameCompoundUniqueInput
    AND?: EnvironmentWhereInput | EnvironmentWhereInput[]
    OR?: EnvironmentWhereInput[]
    NOT?: EnvironmentWhereInput | EnvironmentWhereInput[]
    tenantId?: UuidFilter<"Environment"> | string
    name?: StringFilter<"Environment"> | string
    type?: StringNullableFilter<"Environment"> | string | null
    status?: StringNullableFilter<"Environment"> | string | null
    webClientUrl?: StringNullableFilter<"Environment"> | string | null
    locationName?: StringNullableFilter<"Environment"> | string | null
    applicationVersion?: StringNullableFilter<"Environment"> | string | null
    platformVersion?: StringNullableFilter<"Environment"> | string | null
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
    extensions?: ExtensionListRelationFilter
  }, "tenantId_name">

  export type EnvironmentOrderByWithAggregationInput = {
    tenantId?: SortOrder
    name?: SortOrder
    type?: SortOrderInput | SortOrder
    status?: SortOrderInput | SortOrder
    webClientUrl?: SortOrderInput | SortOrder
    locationName?: SortOrderInput | SortOrder
    applicationVersion?: SortOrderInput | SortOrder
    platformVersion?: SortOrderInput | SortOrder
    _count?: EnvironmentCountOrderByAggregateInput
    _max?: EnvironmentMaxOrderByAggregateInput
    _min?: EnvironmentMinOrderByAggregateInput
  }

  export type EnvironmentScalarWhereWithAggregatesInput = {
    AND?: EnvironmentScalarWhereWithAggregatesInput | EnvironmentScalarWhereWithAggregatesInput[]
    OR?: EnvironmentScalarWhereWithAggregatesInput[]
    NOT?: EnvironmentScalarWhereWithAggregatesInput | EnvironmentScalarWhereWithAggregatesInput[]
    tenantId?: UuidWithAggregatesFilter<"Environment"> | string
    name?: StringWithAggregatesFilter<"Environment"> | string
    type?: StringNullableWithAggregatesFilter<"Environment"> | string | null
    status?: StringNullableWithAggregatesFilter<"Environment"> | string | null
    webClientUrl?: StringNullableWithAggregatesFilter<"Environment"> | string | null
    locationName?: StringNullableWithAggregatesFilter<"Environment"> | string | null
    applicationVersion?: StringNullableWithAggregatesFilter<"Environment"> | string | null
    platformVersion?: StringNullableWithAggregatesFilter<"Environment"> | string | null
  }

  export type ExtensionWhereInput = {
    AND?: ExtensionWhereInput | ExtensionWhereInput[]
    OR?: ExtensionWhereInput[]
    NOT?: ExtensionWhereInput | ExtensionWhereInput[]
    tenantId?: UuidFilter<"Extension"> | string
    environmentName?: StringFilter<"Extension"> | string
    id?: UuidFilter<"Extension"> | string
    name?: StringFilter<"Extension"> | string
    version?: StringFilter<"Extension"> | string
    publisher?: StringFilter<"Extension"> | string
    publishedAs?: StringFilter<"Extension"> | string
    state?: StringNullableFilter<"Extension"> | string | null
    environment?: XOR<EnvironmentScalarRelationFilter, EnvironmentWhereInput>
  }

  export type ExtensionOrderByWithRelationInput = {
    tenantId?: SortOrder
    environmentName?: SortOrder
    id?: SortOrder
    name?: SortOrder
    version?: SortOrder
    publisher?: SortOrder
    publishedAs?: SortOrder
    state?: SortOrderInput | SortOrder
    environment?: EnvironmentOrderByWithRelationInput
  }

  export type ExtensionWhereUniqueInput = Prisma.AtLeast<{
    tenantId_environmentName_id?: ExtensionTenantIdEnvironmentNameIdCompoundUniqueInput
    AND?: ExtensionWhereInput | ExtensionWhereInput[]
    OR?: ExtensionWhereInput[]
    NOT?: ExtensionWhereInput | ExtensionWhereInput[]
    tenantId?: UuidFilter<"Extension"> | string
    environmentName?: StringFilter<"Extension"> | string
    id?: UuidFilter<"Extension"> | string
    name?: StringFilter<"Extension"> | string
    version?: StringFilter<"Extension"> | string
    publisher?: StringFilter<"Extension"> | string
    publishedAs?: StringFilter<"Extension"> | string
    state?: StringNullableFilter<"Extension"> | string | null
    environment?: XOR<EnvironmentScalarRelationFilter, EnvironmentWhereInput>
  }, "tenantId_environmentName_id">

  export type ExtensionOrderByWithAggregationInput = {
    tenantId?: SortOrder
    environmentName?: SortOrder
    id?: SortOrder
    name?: SortOrder
    version?: SortOrder
    publisher?: SortOrder
    publishedAs?: SortOrder
    state?: SortOrderInput | SortOrder
    _count?: ExtensionCountOrderByAggregateInput
    _max?: ExtensionMaxOrderByAggregateInput
    _min?: ExtensionMinOrderByAggregateInput
  }

  export type ExtensionScalarWhereWithAggregatesInput = {
    AND?: ExtensionScalarWhereWithAggregatesInput | ExtensionScalarWhereWithAggregatesInput[]
    OR?: ExtensionScalarWhereWithAggregatesInput[]
    NOT?: ExtensionScalarWhereWithAggregatesInput | ExtensionScalarWhereWithAggregatesInput[]
    tenantId?: UuidWithAggregatesFilter<"Extension"> | string
    environmentName?: StringWithAggregatesFilter<"Extension"> | string
    id?: UuidWithAggregatesFilter<"Extension"> | string
    name?: StringWithAggregatesFilter<"Extension"> | string
    version?: StringWithAggregatesFilter<"Extension"> | string
    publisher?: StringWithAggregatesFilter<"Extension"> | string
    publishedAs?: StringWithAggregatesFilter<"Extension"> | string
    state?: StringNullableWithAggregatesFilter<"Extension"> | string | null
  }

  export type UserCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: $Enums.Role
    githubToken?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    allowedCustomers?: UserCustomerCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: $Enums.Role
    githubToken?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    allowedCustomers?: UserCustomerUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    githubToken?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    allowedCustomers?: UserCustomerUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    githubToken?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    allowedCustomers?: UserCustomerUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: $Enums.Role
    githubToken?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    githubToken?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    githubToken?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomerCreateInput = {
    id?: string
    customerName: string
    imageBase64?: string | null
    tenants?: TenantCreateNestedManyWithoutCustomerInput
    allowedUsers?: UserCustomerCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUncheckedCreateInput = {
    id?: string
    customerName: string
    imageBase64?: string | null
    tenants?: TenantUncheckedCreateNestedManyWithoutCustomerInput
    allowedUsers?: UserCustomerUncheckedCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    imageBase64?: NullableStringFieldUpdateOperationsInput | string | null
    tenants?: TenantUpdateManyWithoutCustomerNestedInput
    allowedUsers?: UserCustomerUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    imageBase64?: NullableStringFieldUpdateOperationsInput | string | null
    tenants?: TenantUncheckedUpdateManyWithoutCustomerNestedInput
    allowedUsers?: UserCustomerUncheckedUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerCreateManyInput = {
    id?: string
    customerName: string
    imageBase64?: string | null
  }

  export type CustomerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    imageBase64?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CustomerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    imageBase64?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserCustomerCreateInput = {
    assignedAt?: Date | string
    user: UserCreateNestedOneWithoutAllowedCustomersInput
    customer: CustomerCreateNestedOneWithoutAllowedUsersInput
  }

  export type UserCustomerUncheckedCreateInput = {
    userId: string
    customerId: string
    assignedAt?: Date | string
  }

  export type UserCustomerUpdateInput = {
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAllowedCustomersNestedInput
    customer?: CustomerUpdateOneRequiredWithoutAllowedUsersNestedInput
  }

  export type UserCustomerUncheckedUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCustomerCreateManyInput = {
    userId: string
    customerId: string
    assignedAt?: Date | string
  }

  export type UserCustomerUpdateManyMutationInput = {
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCustomerUncheckedUpdateManyInput = {
    userId?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantCreateInput = {
    id: string
    description?: string | null
    createdAt: Date | string
    modifiedAt: Date | string
    connectionId?: string | null
    grantType?: string | null
    clientId?: string | null
    clientSecret?: string | null
    scope?: string | null
    token?: string | null
    tokenExpiresAt?: Date | string | null
    customer: CustomerCreateNestedOneWithoutTenantsInput
    environments?: EnvironmentCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateInput = {
    id: string
    customerId: string
    description?: string | null
    createdAt: Date | string
    modifiedAt: Date | string
    connectionId?: string | null
    grantType?: string | null
    clientId?: string | null
    clientSecret?: string | null
    scope?: string | null
    token?: string | null
    tokenExpiresAt?: Date | string | null
    environments?: EnvironmentUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    modifiedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    connectionId?: NullableStringFieldUpdateOperationsInput | string | null
    grantType?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientSecret?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    customer?: CustomerUpdateOneRequiredWithoutTenantsNestedInput
    environments?: EnvironmentUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    modifiedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    connectionId?: NullableStringFieldUpdateOperationsInput | string | null
    grantType?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientSecret?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    environments?: EnvironmentUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type TenantCreateManyInput = {
    id: string
    customerId: string
    description?: string | null
    createdAt: Date | string
    modifiedAt: Date | string
    connectionId?: string | null
    grantType?: string | null
    clientId?: string | null
    clientSecret?: string | null
    scope?: string | null
    token?: string | null
    tokenExpiresAt?: Date | string | null
  }

  export type TenantUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    modifiedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    connectionId?: NullableStringFieldUpdateOperationsInput | string | null
    grantType?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientSecret?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TenantUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    modifiedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    connectionId?: NullableStringFieldUpdateOperationsInput | string | null
    grantType?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientSecret?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type EnvironmentCreateInput = {
    name: string
    type?: string | null
    status?: string | null
    webClientUrl?: string | null
    locationName?: string | null
    applicationVersion?: string | null
    platformVersion?: string | null
    tenant: TenantCreateNestedOneWithoutEnvironmentsInput
    extensions?: ExtensionCreateNestedManyWithoutEnvironmentInput
  }

  export type EnvironmentUncheckedCreateInput = {
    tenantId: string
    name: string
    type?: string | null
    status?: string | null
    webClientUrl?: string | null
    locationName?: string | null
    applicationVersion?: string | null
    platformVersion?: string | null
    extensions?: ExtensionUncheckedCreateNestedManyWithoutEnvironmentInput
  }

  export type EnvironmentUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    type?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    webClientUrl?: NullableStringFieldUpdateOperationsInput | string | null
    locationName?: NullableStringFieldUpdateOperationsInput | string | null
    applicationVersion?: NullableStringFieldUpdateOperationsInput | string | null
    platformVersion?: NullableStringFieldUpdateOperationsInput | string | null
    tenant?: TenantUpdateOneRequiredWithoutEnvironmentsNestedInput
    extensions?: ExtensionUpdateManyWithoutEnvironmentNestedInput
  }

  export type EnvironmentUncheckedUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    webClientUrl?: NullableStringFieldUpdateOperationsInput | string | null
    locationName?: NullableStringFieldUpdateOperationsInput | string | null
    applicationVersion?: NullableStringFieldUpdateOperationsInput | string | null
    platformVersion?: NullableStringFieldUpdateOperationsInput | string | null
    extensions?: ExtensionUncheckedUpdateManyWithoutEnvironmentNestedInput
  }

  export type EnvironmentCreateManyInput = {
    tenantId: string
    name: string
    type?: string | null
    status?: string | null
    webClientUrl?: string | null
    locationName?: string | null
    applicationVersion?: string | null
    platformVersion?: string | null
  }

  export type EnvironmentUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    type?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    webClientUrl?: NullableStringFieldUpdateOperationsInput | string | null
    locationName?: NullableStringFieldUpdateOperationsInput | string | null
    applicationVersion?: NullableStringFieldUpdateOperationsInput | string | null
    platformVersion?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type EnvironmentUncheckedUpdateManyInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    webClientUrl?: NullableStringFieldUpdateOperationsInput | string | null
    locationName?: NullableStringFieldUpdateOperationsInput | string | null
    applicationVersion?: NullableStringFieldUpdateOperationsInput | string | null
    platformVersion?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExtensionCreateInput = {
    id: string
    name: string
    version: string
    publisher: string
    publishedAs: string
    state?: string | null
    environment: EnvironmentCreateNestedOneWithoutExtensionsInput
  }

  export type ExtensionUncheckedCreateInput = {
    tenantId: string
    environmentName: string
    id: string
    name: string
    version: string
    publisher: string
    publishedAs: string
    state?: string | null
  }

  export type ExtensionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    publisher?: StringFieldUpdateOperationsInput | string
    publishedAs?: StringFieldUpdateOperationsInput | string
    state?: NullableStringFieldUpdateOperationsInput | string | null
    environment?: EnvironmentUpdateOneRequiredWithoutExtensionsNestedInput
  }

  export type ExtensionUncheckedUpdateInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    environmentName?: StringFieldUpdateOperationsInput | string
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    publisher?: StringFieldUpdateOperationsInput | string
    publishedAs?: StringFieldUpdateOperationsInput | string
    state?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExtensionCreateManyInput = {
    tenantId: string
    environmentName: string
    id: string
    name: string
    version: string
    publisher: string
    publishedAs: string
    state?: string | null
  }

  export type ExtensionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    publisher?: StringFieldUpdateOperationsInput | string
    publishedAs?: StringFieldUpdateOperationsInput | string
    state?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExtensionUncheckedUpdateManyInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    environmentName?: StringFieldUpdateOperationsInput | string
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    publisher?: StringFieldUpdateOperationsInput | string
    publishedAs?: StringFieldUpdateOperationsInput | string
    state?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type UserCustomerListRelationFilter = {
    every?: UserCustomerWhereInput
    some?: UserCustomerWhereInput
    none?: UserCustomerWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserCustomerOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    githubToken?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    githubToken?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    githubToken?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type TenantListRelationFilter = {
    every?: TenantWhereInput
    some?: TenantWhereInput
    none?: TenantWhereInput
  }

  export type TenantOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CustomerCountOrderByAggregateInput = {
    id?: SortOrder
    customerName?: SortOrder
    imageBase64?: SortOrder
  }

  export type CustomerMaxOrderByAggregateInput = {
    id?: SortOrder
    customerName?: SortOrder
    imageBase64?: SortOrder
  }

  export type CustomerMinOrderByAggregateInput = {
    id?: SortOrder
    customerName?: SortOrder
    imageBase64?: SortOrder
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type CustomerScalarRelationFilter = {
    is?: CustomerWhereInput
    isNot?: CustomerWhereInput
  }

  export type UserCustomerUserIdCustomerIdCompoundUniqueInput = {
    userId: string
    customerId: string
  }

  export type UserCustomerCountOrderByAggregateInput = {
    userId?: SortOrder
    customerId?: SortOrder
    assignedAt?: SortOrder
  }

  export type UserCustomerMaxOrderByAggregateInput = {
    userId?: SortOrder
    customerId?: SortOrder
    assignedAt?: SortOrder
  }

  export type UserCustomerMinOrderByAggregateInput = {
    userId?: SortOrder
    customerId?: SortOrder
    assignedAt?: SortOrder
  }

  export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type EnvironmentListRelationFilter = {
    every?: EnvironmentWhereInput
    some?: EnvironmentWhereInput
    none?: EnvironmentWhereInput
  }

  export type EnvironmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TenantCountOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    modifiedAt?: SortOrder
    connectionId?: SortOrder
    grantType?: SortOrder
    clientId?: SortOrder
    clientSecret?: SortOrder
    scope?: SortOrder
    token?: SortOrder
    tokenExpiresAt?: SortOrder
  }

  export type TenantMaxOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    modifiedAt?: SortOrder
    connectionId?: SortOrder
    grantType?: SortOrder
    clientId?: SortOrder
    clientSecret?: SortOrder
    scope?: SortOrder
    token?: SortOrder
    tokenExpiresAt?: SortOrder
  }

  export type TenantMinOrderByAggregateInput = {
    id?: SortOrder
    customerId?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    modifiedAt?: SortOrder
    connectionId?: SortOrder
    grantType?: SortOrder
    clientId?: SortOrder
    clientSecret?: SortOrder
    scope?: SortOrder
    token?: SortOrder
    tokenExpiresAt?: SortOrder
  }

  export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type TenantScalarRelationFilter = {
    is?: TenantWhereInput
    isNot?: TenantWhereInput
  }

  export type ExtensionListRelationFilter = {
    every?: ExtensionWhereInput
    some?: ExtensionWhereInput
    none?: ExtensionWhereInput
  }

  export type ExtensionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EnvironmentTenantIdNameCompoundUniqueInput = {
    tenantId: string
    name: string
  }

  export type EnvironmentCountOrderByAggregateInput = {
    tenantId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    status?: SortOrder
    webClientUrl?: SortOrder
    locationName?: SortOrder
    applicationVersion?: SortOrder
    platformVersion?: SortOrder
  }

  export type EnvironmentMaxOrderByAggregateInput = {
    tenantId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    status?: SortOrder
    webClientUrl?: SortOrder
    locationName?: SortOrder
    applicationVersion?: SortOrder
    platformVersion?: SortOrder
  }

  export type EnvironmentMinOrderByAggregateInput = {
    tenantId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    status?: SortOrder
    webClientUrl?: SortOrder
    locationName?: SortOrder
    applicationVersion?: SortOrder
    platformVersion?: SortOrder
  }

  export type EnvironmentScalarRelationFilter = {
    is?: EnvironmentWhereInput
    isNot?: EnvironmentWhereInput
  }

  export type ExtensionTenantIdEnvironmentNameIdCompoundUniqueInput = {
    tenantId: string
    environmentName: string
    id: string
  }

  export type ExtensionCountOrderByAggregateInput = {
    tenantId?: SortOrder
    environmentName?: SortOrder
    id?: SortOrder
    name?: SortOrder
    version?: SortOrder
    publisher?: SortOrder
    publishedAs?: SortOrder
    state?: SortOrder
  }

  export type ExtensionMaxOrderByAggregateInput = {
    tenantId?: SortOrder
    environmentName?: SortOrder
    id?: SortOrder
    name?: SortOrder
    version?: SortOrder
    publisher?: SortOrder
    publishedAs?: SortOrder
    state?: SortOrder
  }

  export type ExtensionMinOrderByAggregateInput = {
    tenantId?: SortOrder
    environmentName?: SortOrder
    id?: SortOrder
    name?: SortOrder
    version?: SortOrder
    publisher?: SortOrder
    publishedAs?: SortOrder
    state?: SortOrder
  }

  export type UserCustomerCreateNestedManyWithoutUserInput = {
    create?: XOR<UserCustomerCreateWithoutUserInput, UserCustomerUncheckedCreateWithoutUserInput> | UserCustomerCreateWithoutUserInput[] | UserCustomerUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserCustomerCreateOrConnectWithoutUserInput | UserCustomerCreateOrConnectWithoutUserInput[]
    createMany?: UserCustomerCreateManyUserInputEnvelope
    connect?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
  }

  export type UserCustomerUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserCustomerCreateWithoutUserInput, UserCustomerUncheckedCreateWithoutUserInput> | UserCustomerCreateWithoutUserInput[] | UserCustomerUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserCustomerCreateOrConnectWithoutUserInput | UserCustomerCreateOrConnectWithoutUserInput[]
    createMany?: UserCustomerCreateManyUserInputEnvelope
    connect?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserCustomerUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserCustomerCreateWithoutUserInput, UserCustomerUncheckedCreateWithoutUserInput> | UserCustomerCreateWithoutUserInput[] | UserCustomerUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserCustomerCreateOrConnectWithoutUserInput | UserCustomerCreateOrConnectWithoutUserInput[]
    upsert?: UserCustomerUpsertWithWhereUniqueWithoutUserInput | UserCustomerUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserCustomerCreateManyUserInputEnvelope
    set?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
    disconnect?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
    delete?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
    connect?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
    update?: UserCustomerUpdateWithWhereUniqueWithoutUserInput | UserCustomerUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserCustomerUpdateManyWithWhereWithoutUserInput | UserCustomerUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserCustomerScalarWhereInput | UserCustomerScalarWhereInput[]
  }

  export type UserCustomerUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserCustomerCreateWithoutUserInput, UserCustomerUncheckedCreateWithoutUserInput> | UserCustomerCreateWithoutUserInput[] | UserCustomerUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserCustomerCreateOrConnectWithoutUserInput | UserCustomerCreateOrConnectWithoutUserInput[]
    upsert?: UserCustomerUpsertWithWhereUniqueWithoutUserInput | UserCustomerUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserCustomerCreateManyUserInputEnvelope
    set?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
    disconnect?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
    delete?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
    connect?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
    update?: UserCustomerUpdateWithWhereUniqueWithoutUserInput | UserCustomerUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserCustomerUpdateManyWithWhereWithoutUserInput | UserCustomerUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserCustomerScalarWhereInput | UserCustomerScalarWhereInput[]
  }

  export type TenantCreateNestedManyWithoutCustomerInput = {
    create?: XOR<TenantCreateWithoutCustomerInput, TenantUncheckedCreateWithoutCustomerInput> | TenantCreateWithoutCustomerInput[] | TenantUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: TenantCreateOrConnectWithoutCustomerInput | TenantCreateOrConnectWithoutCustomerInput[]
    createMany?: TenantCreateManyCustomerInputEnvelope
    connect?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
  }

  export type UserCustomerCreateNestedManyWithoutCustomerInput = {
    create?: XOR<UserCustomerCreateWithoutCustomerInput, UserCustomerUncheckedCreateWithoutCustomerInput> | UserCustomerCreateWithoutCustomerInput[] | UserCustomerUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: UserCustomerCreateOrConnectWithoutCustomerInput | UserCustomerCreateOrConnectWithoutCustomerInput[]
    createMany?: UserCustomerCreateManyCustomerInputEnvelope
    connect?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
  }

  export type TenantUncheckedCreateNestedManyWithoutCustomerInput = {
    create?: XOR<TenantCreateWithoutCustomerInput, TenantUncheckedCreateWithoutCustomerInput> | TenantCreateWithoutCustomerInput[] | TenantUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: TenantCreateOrConnectWithoutCustomerInput | TenantCreateOrConnectWithoutCustomerInput[]
    createMany?: TenantCreateManyCustomerInputEnvelope
    connect?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
  }

  export type UserCustomerUncheckedCreateNestedManyWithoutCustomerInput = {
    create?: XOR<UserCustomerCreateWithoutCustomerInput, UserCustomerUncheckedCreateWithoutCustomerInput> | UserCustomerCreateWithoutCustomerInput[] | UserCustomerUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: UserCustomerCreateOrConnectWithoutCustomerInput | UserCustomerCreateOrConnectWithoutCustomerInput[]
    createMany?: UserCustomerCreateManyCustomerInputEnvelope
    connect?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
  }

  export type TenantUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<TenantCreateWithoutCustomerInput, TenantUncheckedCreateWithoutCustomerInput> | TenantCreateWithoutCustomerInput[] | TenantUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: TenantCreateOrConnectWithoutCustomerInput | TenantCreateOrConnectWithoutCustomerInput[]
    upsert?: TenantUpsertWithWhereUniqueWithoutCustomerInput | TenantUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: TenantCreateManyCustomerInputEnvelope
    set?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    disconnect?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    delete?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    connect?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    update?: TenantUpdateWithWhereUniqueWithoutCustomerInput | TenantUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: TenantUpdateManyWithWhereWithoutCustomerInput | TenantUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: TenantScalarWhereInput | TenantScalarWhereInput[]
  }

  export type UserCustomerUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<UserCustomerCreateWithoutCustomerInput, UserCustomerUncheckedCreateWithoutCustomerInput> | UserCustomerCreateWithoutCustomerInput[] | UserCustomerUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: UserCustomerCreateOrConnectWithoutCustomerInput | UserCustomerCreateOrConnectWithoutCustomerInput[]
    upsert?: UserCustomerUpsertWithWhereUniqueWithoutCustomerInput | UserCustomerUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: UserCustomerCreateManyCustomerInputEnvelope
    set?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
    disconnect?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
    delete?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
    connect?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
    update?: UserCustomerUpdateWithWhereUniqueWithoutCustomerInput | UserCustomerUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: UserCustomerUpdateManyWithWhereWithoutCustomerInput | UserCustomerUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: UserCustomerScalarWhereInput | UserCustomerScalarWhereInput[]
  }

  export type TenantUncheckedUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<TenantCreateWithoutCustomerInput, TenantUncheckedCreateWithoutCustomerInput> | TenantCreateWithoutCustomerInput[] | TenantUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: TenantCreateOrConnectWithoutCustomerInput | TenantCreateOrConnectWithoutCustomerInput[]
    upsert?: TenantUpsertWithWhereUniqueWithoutCustomerInput | TenantUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: TenantCreateManyCustomerInputEnvelope
    set?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    disconnect?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    delete?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    connect?: TenantWhereUniqueInput | TenantWhereUniqueInput[]
    update?: TenantUpdateWithWhereUniqueWithoutCustomerInput | TenantUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: TenantUpdateManyWithWhereWithoutCustomerInput | TenantUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: TenantScalarWhereInput | TenantScalarWhereInput[]
  }

  export type UserCustomerUncheckedUpdateManyWithoutCustomerNestedInput = {
    create?: XOR<UserCustomerCreateWithoutCustomerInput, UserCustomerUncheckedCreateWithoutCustomerInput> | UserCustomerCreateWithoutCustomerInput[] | UserCustomerUncheckedCreateWithoutCustomerInput[]
    connectOrCreate?: UserCustomerCreateOrConnectWithoutCustomerInput | UserCustomerCreateOrConnectWithoutCustomerInput[]
    upsert?: UserCustomerUpsertWithWhereUniqueWithoutCustomerInput | UserCustomerUpsertWithWhereUniqueWithoutCustomerInput[]
    createMany?: UserCustomerCreateManyCustomerInputEnvelope
    set?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
    disconnect?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
    delete?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
    connect?: UserCustomerWhereUniqueInput | UserCustomerWhereUniqueInput[]
    update?: UserCustomerUpdateWithWhereUniqueWithoutCustomerInput | UserCustomerUpdateWithWhereUniqueWithoutCustomerInput[]
    updateMany?: UserCustomerUpdateManyWithWhereWithoutCustomerInput | UserCustomerUpdateManyWithWhereWithoutCustomerInput[]
    deleteMany?: UserCustomerScalarWhereInput | UserCustomerScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutAllowedCustomersInput = {
    create?: XOR<UserCreateWithoutAllowedCustomersInput, UserUncheckedCreateWithoutAllowedCustomersInput>
    connectOrCreate?: UserCreateOrConnectWithoutAllowedCustomersInput
    connect?: UserWhereUniqueInput
  }

  export type CustomerCreateNestedOneWithoutAllowedUsersInput = {
    create?: XOR<CustomerCreateWithoutAllowedUsersInput, CustomerUncheckedCreateWithoutAllowedUsersInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutAllowedUsersInput
    connect?: CustomerWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutAllowedCustomersNestedInput = {
    create?: XOR<UserCreateWithoutAllowedCustomersInput, UserUncheckedCreateWithoutAllowedCustomersInput>
    connectOrCreate?: UserCreateOrConnectWithoutAllowedCustomersInput
    upsert?: UserUpsertWithoutAllowedCustomersInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAllowedCustomersInput, UserUpdateWithoutAllowedCustomersInput>, UserUncheckedUpdateWithoutAllowedCustomersInput>
  }

  export type CustomerUpdateOneRequiredWithoutAllowedUsersNestedInput = {
    create?: XOR<CustomerCreateWithoutAllowedUsersInput, CustomerUncheckedCreateWithoutAllowedUsersInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutAllowedUsersInput
    upsert?: CustomerUpsertWithoutAllowedUsersInput
    connect?: CustomerWhereUniqueInput
    update?: XOR<XOR<CustomerUpdateToOneWithWhereWithoutAllowedUsersInput, CustomerUpdateWithoutAllowedUsersInput>, CustomerUncheckedUpdateWithoutAllowedUsersInput>
  }

  export type CustomerCreateNestedOneWithoutTenantsInput = {
    create?: XOR<CustomerCreateWithoutTenantsInput, CustomerUncheckedCreateWithoutTenantsInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutTenantsInput
    connect?: CustomerWhereUniqueInput
  }

  export type EnvironmentCreateNestedManyWithoutTenantInput = {
    create?: XOR<EnvironmentCreateWithoutTenantInput, EnvironmentUncheckedCreateWithoutTenantInput> | EnvironmentCreateWithoutTenantInput[] | EnvironmentUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: EnvironmentCreateOrConnectWithoutTenantInput | EnvironmentCreateOrConnectWithoutTenantInput[]
    createMany?: EnvironmentCreateManyTenantInputEnvelope
    connect?: EnvironmentWhereUniqueInput | EnvironmentWhereUniqueInput[]
  }

  export type EnvironmentUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<EnvironmentCreateWithoutTenantInput, EnvironmentUncheckedCreateWithoutTenantInput> | EnvironmentCreateWithoutTenantInput[] | EnvironmentUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: EnvironmentCreateOrConnectWithoutTenantInput | EnvironmentCreateOrConnectWithoutTenantInput[]
    createMany?: EnvironmentCreateManyTenantInputEnvelope
    connect?: EnvironmentWhereUniqueInput | EnvironmentWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type CustomerUpdateOneRequiredWithoutTenantsNestedInput = {
    create?: XOR<CustomerCreateWithoutTenantsInput, CustomerUncheckedCreateWithoutTenantsInput>
    connectOrCreate?: CustomerCreateOrConnectWithoutTenantsInput
    upsert?: CustomerUpsertWithoutTenantsInput
    connect?: CustomerWhereUniqueInput
    update?: XOR<XOR<CustomerUpdateToOneWithWhereWithoutTenantsInput, CustomerUpdateWithoutTenantsInput>, CustomerUncheckedUpdateWithoutTenantsInput>
  }

  export type EnvironmentUpdateManyWithoutTenantNestedInput = {
    create?: XOR<EnvironmentCreateWithoutTenantInput, EnvironmentUncheckedCreateWithoutTenantInput> | EnvironmentCreateWithoutTenantInput[] | EnvironmentUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: EnvironmentCreateOrConnectWithoutTenantInput | EnvironmentCreateOrConnectWithoutTenantInput[]
    upsert?: EnvironmentUpsertWithWhereUniqueWithoutTenantInput | EnvironmentUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: EnvironmentCreateManyTenantInputEnvelope
    set?: EnvironmentWhereUniqueInput | EnvironmentWhereUniqueInput[]
    disconnect?: EnvironmentWhereUniqueInput | EnvironmentWhereUniqueInput[]
    delete?: EnvironmentWhereUniqueInput | EnvironmentWhereUniqueInput[]
    connect?: EnvironmentWhereUniqueInput | EnvironmentWhereUniqueInput[]
    update?: EnvironmentUpdateWithWhereUniqueWithoutTenantInput | EnvironmentUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: EnvironmentUpdateManyWithWhereWithoutTenantInput | EnvironmentUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: EnvironmentScalarWhereInput | EnvironmentScalarWhereInput[]
  }

  export type EnvironmentUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<EnvironmentCreateWithoutTenantInput, EnvironmentUncheckedCreateWithoutTenantInput> | EnvironmentCreateWithoutTenantInput[] | EnvironmentUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: EnvironmentCreateOrConnectWithoutTenantInput | EnvironmentCreateOrConnectWithoutTenantInput[]
    upsert?: EnvironmentUpsertWithWhereUniqueWithoutTenantInput | EnvironmentUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: EnvironmentCreateManyTenantInputEnvelope
    set?: EnvironmentWhereUniqueInput | EnvironmentWhereUniqueInput[]
    disconnect?: EnvironmentWhereUniqueInput | EnvironmentWhereUniqueInput[]
    delete?: EnvironmentWhereUniqueInput | EnvironmentWhereUniqueInput[]
    connect?: EnvironmentWhereUniqueInput | EnvironmentWhereUniqueInput[]
    update?: EnvironmentUpdateWithWhereUniqueWithoutTenantInput | EnvironmentUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: EnvironmentUpdateManyWithWhereWithoutTenantInput | EnvironmentUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: EnvironmentScalarWhereInput | EnvironmentScalarWhereInput[]
  }

  export type TenantCreateNestedOneWithoutEnvironmentsInput = {
    create?: XOR<TenantCreateWithoutEnvironmentsInput, TenantUncheckedCreateWithoutEnvironmentsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutEnvironmentsInput
    connect?: TenantWhereUniqueInput
  }

  export type ExtensionCreateNestedManyWithoutEnvironmentInput = {
    create?: XOR<ExtensionCreateWithoutEnvironmentInput, ExtensionUncheckedCreateWithoutEnvironmentInput> | ExtensionCreateWithoutEnvironmentInput[] | ExtensionUncheckedCreateWithoutEnvironmentInput[]
    connectOrCreate?: ExtensionCreateOrConnectWithoutEnvironmentInput | ExtensionCreateOrConnectWithoutEnvironmentInput[]
    createMany?: ExtensionCreateManyEnvironmentInputEnvelope
    connect?: ExtensionWhereUniqueInput | ExtensionWhereUniqueInput[]
  }

  export type ExtensionUncheckedCreateNestedManyWithoutEnvironmentInput = {
    create?: XOR<ExtensionCreateWithoutEnvironmentInput, ExtensionUncheckedCreateWithoutEnvironmentInput> | ExtensionCreateWithoutEnvironmentInput[] | ExtensionUncheckedCreateWithoutEnvironmentInput[]
    connectOrCreate?: ExtensionCreateOrConnectWithoutEnvironmentInput | ExtensionCreateOrConnectWithoutEnvironmentInput[]
    createMany?: ExtensionCreateManyEnvironmentInputEnvelope
    connect?: ExtensionWhereUniqueInput | ExtensionWhereUniqueInput[]
  }

  export type TenantUpdateOneRequiredWithoutEnvironmentsNestedInput = {
    create?: XOR<TenantCreateWithoutEnvironmentsInput, TenantUncheckedCreateWithoutEnvironmentsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutEnvironmentsInput
    upsert?: TenantUpsertWithoutEnvironmentsInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutEnvironmentsInput, TenantUpdateWithoutEnvironmentsInput>, TenantUncheckedUpdateWithoutEnvironmentsInput>
  }

  export type ExtensionUpdateManyWithoutEnvironmentNestedInput = {
    create?: XOR<ExtensionCreateWithoutEnvironmentInput, ExtensionUncheckedCreateWithoutEnvironmentInput> | ExtensionCreateWithoutEnvironmentInput[] | ExtensionUncheckedCreateWithoutEnvironmentInput[]
    connectOrCreate?: ExtensionCreateOrConnectWithoutEnvironmentInput | ExtensionCreateOrConnectWithoutEnvironmentInput[]
    upsert?: ExtensionUpsertWithWhereUniqueWithoutEnvironmentInput | ExtensionUpsertWithWhereUniqueWithoutEnvironmentInput[]
    createMany?: ExtensionCreateManyEnvironmentInputEnvelope
    set?: ExtensionWhereUniqueInput | ExtensionWhereUniqueInput[]
    disconnect?: ExtensionWhereUniqueInput | ExtensionWhereUniqueInput[]
    delete?: ExtensionWhereUniqueInput | ExtensionWhereUniqueInput[]
    connect?: ExtensionWhereUniqueInput | ExtensionWhereUniqueInput[]
    update?: ExtensionUpdateWithWhereUniqueWithoutEnvironmentInput | ExtensionUpdateWithWhereUniqueWithoutEnvironmentInput[]
    updateMany?: ExtensionUpdateManyWithWhereWithoutEnvironmentInput | ExtensionUpdateManyWithWhereWithoutEnvironmentInput[]
    deleteMany?: ExtensionScalarWhereInput | ExtensionScalarWhereInput[]
  }

  export type ExtensionUncheckedUpdateManyWithoutEnvironmentNestedInput = {
    create?: XOR<ExtensionCreateWithoutEnvironmentInput, ExtensionUncheckedCreateWithoutEnvironmentInput> | ExtensionCreateWithoutEnvironmentInput[] | ExtensionUncheckedCreateWithoutEnvironmentInput[]
    connectOrCreate?: ExtensionCreateOrConnectWithoutEnvironmentInput | ExtensionCreateOrConnectWithoutEnvironmentInput[]
    upsert?: ExtensionUpsertWithWhereUniqueWithoutEnvironmentInput | ExtensionUpsertWithWhereUniqueWithoutEnvironmentInput[]
    createMany?: ExtensionCreateManyEnvironmentInputEnvelope
    set?: ExtensionWhereUniqueInput | ExtensionWhereUniqueInput[]
    disconnect?: ExtensionWhereUniqueInput | ExtensionWhereUniqueInput[]
    delete?: ExtensionWhereUniqueInput | ExtensionWhereUniqueInput[]
    connect?: ExtensionWhereUniqueInput | ExtensionWhereUniqueInput[]
    update?: ExtensionUpdateWithWhereUniqueWithoutEnvironmentInput | ExtensionUpdateWithWhereUniqueWithoutEnvironmentInput[]
    updateMany?: ExtensionUpdateManyWithWhereWithoutEnvironmentInput | ExtensionUpdateManyWithWhereWithoutEnvironmentInput[]
    deleteMany?: ExtensionScalarWhereInput | ExtensionScalarWhereInput[]
  }

  export type EnvironmentCreateNestedOneWithoutExtensionsInput = {
    create?: XOR<EnvironmentCreateWithoutExtensionsInput, EnvironmentUncheckedCreateWithoutExtensionsInput>
    connectOrCreate?: EnvironmentCreateOrConnectWithoutExtensionsInput
    connect?: EnvironmentWhereUniqueInput
  }

  export type EnvironmentUpdateOneRequiredWithoutExtensionsNestedInput = {
    create?: XOR<EnvironmentCreateWithoutExtensionsInput, EnvironmentUncheckedCreateWithoutExtensionsInput>
    connectOrCreate?: EnvironmentCreateOrConnectWithoutExtensionsInput
    upsert?: EnvironmentUpsertWithoutExtensionsInput
    connect?: EnvironmentWhereUniqueInput
    update?: XOR<XOR<EnvironmentUpdateToOneWithWhereWithoutExtensionsInput, EnvironmentUpdateWithoutExtensionsInput>, EnvironmentUncheckedUpdateWithoutExtensionsInput>
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type UserCustomerCreateWithoutUserInput = {
    assignedAt?: Date | string
    customer: CustomerCreateNestedOneWithoutAllowedUsersInput
  }

  export type UserCustomerUncheckedCreateWithoutUserInput = {
    customerId: string
    assignedAt?: Date | string
  }

  export type UserCustomerCreateOrConnectWithoutUserInput = {
    where: UserCustomerWhereUniqueInput
    create: XOR<UserCustomerCreateWithoutUserInput, UserCustomerUncheckedCreateWithoutUserInput>
  }

  export type UserCustomerCreateManyUserInputEnvelope = {
    data: UserCustomerCreateManyUserInput | UserCustomerCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserCustomerUpsertWithWhereUniqueWithoutUserInput = {
    where: UserCustomerWhereUniqueInput
    update: XOR<UserCustomerUpdateWithoutUserInput, UserCustomerUncheckedUpdateWithoutUserInput>
    create: XOR<UserCustomerCreateWithoutUserInput, UserCustomerUncheckedCreateWithoutUserInput>
  }

  export type UserCustomerUpdateWithWhereUniqueWithoutUserInput = {
    where: UserCustomerWhereUniqueInput
    data: XOR<UserCustomerUpdateWithoutUserInput, UserCustomerUncheckedUpdateWithoutUserInput>
  }

  export type UserCustomerUpdateManyWithWhereWithoutUserInput = {
    where: UserCustomerScalarWhereInput
    data: XOR<UserCustomerUpdateManyMutationInput, UserCustomerUncheckedUpdateManyWithoutUserInput>
  }

  export type UserCustomerScalarWhereInput = {
    AND?: UserCustomerScalarWhereInput | UserCustomerScalarWhereInput[]
    OR?: UserCustomerScalarWhereInput[]
    NOT?: UserCustomerScalarWhereInput | UserCustomerScalarWhereInput[]
    userId?: UuidFilter<"UserCustomer"> | string
    customerId?: UuidFilter<"UserCustomer"> | string
    assignedAt?: DateTimeFilter<"UserCustomer"> | Date | string
  }

  export type TenantCreateWithoutCustomerInput = {
    id: string
    description?: string | null
    createdAt: Date | string
    modifiedAt: Date | string
    connectionId?: string | null
    grantType?: string | null
    clientId?: string | null
    clientSecret?: string | null
    scope?: string | null
    token?: string | null
    tokenExpiresAt?: Date | string | null
    environments?: EnvironmentCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutCustomerInput = {
    id: string
    description?: string | null
    createdAt: Date | string
    modifiedAt: Date | string
    connectionId?: string | null
    grantType?: string | null
    clientId?: string | null
    clientSecret?: string | null
    scope?: string | null
    token?: string | null
    tokenExpiresAt?: Date | string | null
    environments?: EnvironmentUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutCustomerInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutCustomerInput, TenantUncheckedCreateWithoutCustomerInput>
  }

  export type TenantCreateManyCustomerInputEnvelope = {
    data: TenantCreateManyCustomerInput | TenantCreateManyCustomerInput[]
    skipDuplicates?: boolean
  }

  export type UserCustomerCreateWithoutCustomerInput = {
    assignedAt?: Date | string
    user: UserCreateNestedOneWithoutAllowedCustomersInput
  }

  export type UserCustomerUncheckedCreateWithoutCustomerInput = {
    userId: string
    assignedAt?: Date | string
  }

  export type UserCustomerCreateOrConnectWithoutCustomerInput = {
    where: UserCustomerWhereUniqueInput
    create: XOR<UserCustomerCreateWithoutCustomerInput, UserCustomerUncheckedCreateWithoutCustomerInput>
  }

  export type UserCustomerCreateManyCustomerInputEnvelope = {
    data: UserCustomerCreateManyCustomerInput | UserCustomerCreateManyCustomerInput[]
    skipDuplicates?: boolean
  }

  export type TenantUpsertWithWhereUniqueWithoutCustomerInput = {
    where: TenantWhereUniqueInput
    update: XOR<TenantUpdateWithoutCustomerInput, TenantUncheckedUpdateWithoutCustomerInput>
    create: XOR<TenantCreateWithoutCustomerInput, TenantUncheckedCreateWithoutCustomerInput>
  }

  export type TenantUpdateWithWhereUniqueWithoutCustomerInput = {
    where: TenantWhereUniqueInput
    data: XOR<TenantUpdateWithoutCustomerInput, TenantUncheckedUpdateWithoutCustomerInput>
  }

  export type TenantUpdateManyWithWhereWithoutCustomerInput = {
    where: TenantScalarWhereInput
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyWithoutCustomerInput>
  }

  export type TenantScalarWhereInput = {
    AND?: TenantScalarWhereInput | TenantScalarWhereInput[]
    OR?: TenantScalarWhereInput[]
    NOT?: TenantScalarWhereInput | TenantScalarWhereInput[]
    id?: UuidFilter<"Tenant"> | string
    customerId?: UuidFilter<"Tenant"> | string
    description?: StringNullableFilter<"Tenant"> | string | null
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    modifiedAt?: DateTimeFilter<"Tenant"> | Date | string
    connectionId?: UuidNullableFilter<"Tenant"> | string | null
    grantType?: StringNullableFilter<"Tenant"> | string | null
    clientId?: UuidNullableFilter<"Tenant"> | string | null
    clientSecret?: StringNullableFilter<"Tenant"> | string | null
    scope?: StringNullableFilter<"Tenant"> | string | null
    token?: StringNullableFilter<"Tenant"> | string | null
    tokenExpiresAt?: DateTimeNullableFilter<"Tenant"> | Date | string | null
  }

  export type UserCustomerUpsertWithWhereUniqueWithoutCustomerInput = {
    where: UserCustomerWhereUniqueInput
    update: XOR<UserCustomerUpdateWithoutCustomerInput, UserCustomerUncheckedUpdateWithoutCustomerInput>
    create: XOR<UserCustomerCreateWithoutCustomerInput, UserCustomerUncheckedCreateWithoutCustomerInput>
  }

  export type UserCustomerUpdateWithWhereUniqueWithoutCustomerInput = {
    where: UserCustomerWhereUniqueInput
    data: XOR<UserCustomerUpdateWithoutCustomerInput, UserCustomerUncheckedUpdateWithoutCustomerInput>
  }

  export type UserCustomerUpdateManyWithWhereWithoutCustomerInput = {
    where: UserCustomerScalarWhereInput
    data: XOR<UserCustomerUpdateManyMutationInput, UserCustomerUncheckedUpdateManyWithoutCustomerInput>
  }

  export type UserCreateWithoutAllowedCustomersInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: $Enums.Role
    githubToken?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUncheckedCreateWithoutAllowedCustomersInput = {
    id?: string
    name: string
    email: string
    password: string
    role?: $Enums.Role
    githubToken?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCreateOrConnectWithoutAllowedCustomersInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAllowedCustomersInput, UserUncheckedCreateWithoutAllowedCustomersInput>
  }

  export type CustomerCreateWithoutAllowedUsersInput = {
    id?: string
    customerName: string
    imageBase64?: string | null
    tenants?: TenantCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUncheckedCreateWithoutAllowedUsersInput = {
    id?: string
    customerName: string
    imageBase64?: string | null
    tenants?: TenantUncheckedCreateNestedManyWithoutCustomerInput
  }

  export type CustomerCreateOrConnectWithoutAllowedUsersInput = {
    where: CustomerWhereUniqueInput
    create: XOR<CustomerCreateWithoutAllowedUsersInput, CustomerUncheckedCreateWithoutAllowedUsersInput>
  }

  export type UserUpsertWithoutAllowedCustomersInput = {
    update: XOR<UserUpdateWithoutAllowedCustomersInput, UserUncheckedUpdateWithoutAllowedCustomersInput>
    create: XOR<UserCreateWithoutAllowedCustomersInput, UserUncheckedCreateWithoutAllowedCustomersInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAllowedCustomersInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAllowedCustomersInput, UserUncheckedUpdateWithoutAllowedCustomersInput>
  }

  export type UserUpdateWithoutAllowedCustomersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    githubToken?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateWithoutAllowedCustomersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    githubToken?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustomerUpsertWithoutAllowedUsersInput = {
    update: XOR<CustomerUpdateWithoutAllowedUsersInput, CustomerUncheckedUpdateWithoutAllowedUsersInput>
    create: XOR<CustomerCreateWithoutAllowedUsersInput, CustomerUncheckedCreateWithoutAllowedUsersInput>
    where?: CustomerWhereInput
  }

  export type CustomerUpdateToOneWithWhereWithoutAllowedUsersInput = {
    where?: CustomerWhereInput
    data: XOR<CustomerUpdateWithoutAllowedUsersInput, CustomerUncheckedUpdateWithoutAllowedUsersInput>
  }

  export type CustomerUpdateWithoutAllowedUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    imageBase64?: NullableStringFieldUpdateOperationsInput | string | null
    tenants?: TenantUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerUncheckedUpdateWithoutAllowedUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    imageBase64?: NullableStringFieldUpdateOperationsInput | string | null
    tenants?: TenantUncheckedUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerCreateWithoutTenantsInput = {
    id?: string
    customerName: string
    imageBase64?: string | null
    allowedUsers?: UserCustomerCreateNestedManyWithoutCustomerInput
  }

  export type CustomerUncheckedCreateWithoutTenantsInput = {
    id?: string
    customerName: string
    imageBase64?: string | null
    allowedUsers?: UserCustomerUncheckedCreateNestedManyWithoutCustomerInput
  }

  export type CustomerCreateOrConnectWithoutTenantsInput = {
    where: CustomerWhereUniqueInput
    create: XOR<CustomerCreateWithoutTenantsInput, CustomerUncheckedCreateWithoutTenantsInput>
  }

  export type EnvironmentCreateWithoutTenantInput = {
    name: string
    type?: string | null
    status?: string | null
    webClientUrl?: string | null
    locationName?: string | null
    applicationVersion?: string | null
    platformVersion?: string | null
    extensions?: ExtensionCreateNestedManyWithoutEnvironmentInput
  }

  export type EnvironmentUncheckedCreateWithoutTenantInput = {
    name: string
    type?: string | null
    status?: string | null
    webClientUrl?: string | null
    locationName?: string | null
    applicationVersion?: string | null
    platformVersion?: string | null
    extensions?: ExtensionUncheckedCreateNestedManyWithoutEnvironmentInput
  }

  export type EnvironmentCreateOrConnectWithoutTenantInput = {
    where: EnvironmentWhereUniqueInput
    create: XOR<EnvironmentCreateWithoutTenantInput, EnvironmentUncheckedCreateWithoutTenantInput>
  }

  export type EnvironmentCreateManyTenantInputEnvelope = {
    data: EnvironmentCreateManyTenantInput | EnvironmentCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type CustomerUpsertWithoutTenantsInput = {
    update: XOR<CustomerUpdateWithoutTenantsInput, CustomerUncheckedUpdateWithoutTenantsInput>
    create: XOR<CustomerCreateWithoutTenantsInput, CustomerUncheckedCreateWithoutTenantsInput>
    where?: CustomerWhereInput
  }

  export type CustomerUpdateToOneWithWhereWithoutTenantsInput = {
    where?: CustomerWhereInput
    data: XOR<CustomerUpdateWithoutTenantsInput, CustomerUncheckedUpdateWithoutTenantsInput>
  }

  export type CustomerUpdateWithoutTenantsInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    imageBase64?: NullableStringFieldUpdateOperationsInput | string | null
    allowedUsers?: UserCustomerUpdateManyWithoutCustomerNestedInput
  }

  export type CustomerUncheckedUpdateWithoutTenantsInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    imageBase64?: NullableStringFieldUpdateOperationsInput | string | null
    allowedUsers?: UserCustomerUncheckedUpdateManyWithoutCustomerNestedInput
  }

  export type EnvironmentUpsertWithWhereUniqueWithoutTenantInput = {
    where: EnvironmentWhereUniqueInput
    update: XOR<EnvironmentUpdateWithoutTenantInput, EnvironmentUncheckedUpdateWithoutTenantInput>
    create: XOR<EnvironmentCreateWithoutTenantInput, EnvironmentUncheckedCreateWithoutTenantInput>
  }

  export type EnvironmentUpdateWithWhereUniqueWithoutTenantInput = {
    where: EnvironmentWhereUniqueInput
    data: XOR<EnvironmentUpdateWithoutTenantInput, EnvironmentUncheckedUpdateWithoutTenantInput>
  }

  export type EnvironmentUpdateManyWithWhereWithoutTenantInput = {
    where: EnvironmentScalarWhereInput
    data: XOR<EnvironmentUpdateManyMutationInput, EnvironmentUncheckedUpdateManyWithoutTenantInput>
  }

  export type EnvironmentScalarWhereInput = {
    AND?: EnvironmentScalarWhereInput | EnvironmentScalarWhereInput[]
    OR?: EnvironmentScalarWhereInput[]
    NOT?: EnvironmentScalarWhereInput | EnvironmentScalarWhereInput[]
    tenantId?: UuidFilter<"Environment"> | string
    name?: StringFilter<"Environment"> | string
    type?: StringNullableFilter<"Environment"> | string | null
    status?: StringNullableFilter<"Environment"> | string | null
    webClientUrl?: StringNullableFilter<"Environment"> | string | null
    locationName?: StringNullableFilter<"Environment"> | string | null
    applicationVersion?: StringNullableFilter<"Environment"> | string | null
    platformVersion?: StringNullableFilter<"Environment"> | string | null
  }

  export type TenantCreateWithoutEnvironmentsInput = {
    id: string
    description?: string | null
    createdAt: Date | string
    modifiedAt: Date | string
    connectionId?: string | null
    grantType?: string | null
    clientId?: string | null
    clientSecret?: string | null
    scope?: string | null
    token?: string | null
    tokenExpiresAt?: Date | string | null
    customer: CustomerCreateNestedOneWithoutTenantsInput
  }

  export type TenantUncheckedCreateWithoutEnvironmentsInput = {
    id: string
    customerId: string
    description?: string | null
    createdAt: Date | string
    modifiedAt: Date | string
    connectionId?: string | null
    grantType?: string | null
    clientId?: string | null
    clientSecret?: string | null
    scope?: string | null
    token?: string | null
    tokenExpiresAt?: Date | string | null
  }

  export type TenantCreateOrConnectWithoutEnvironmentsInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutEnvironmentsInput, TenantUncheckedCreateWithoutEnvironmentsInput>
  }

  export type ExtensionCreateWithoutEnvironmentInput = {
    id: string
    name: string
    version: string
    publisher: string
    publishedAs: string
    state?: string | null
  }

  export type ExtensionUncheckedCreateWithoutEnvironmentInput = {
    id: string
    name: string
    version: string
    publisher: string
    publishedAs: string
    state?: string | null
  }

  export type ExtensionCreateOrConnectWithoutEnvironmentInput = {
    where: ExtensionWhereUniqueInput
    create: XOR<ExtensionCreateWithoutEnvironmentInput, ExtensionUncheckedCreateWithoutEnvironmentInput>
  }

  export type ExtensionCreateManyEnvironmentInputEnvelope = {
    data: ExtensionCreateManyEnvironmentInput | ExtensionCreateManyEnvironmentInput[]
    skipDuplicates?: boolean
  }

  export type TenantUpsertWithoutEnvironmentsInput = {
    update: XOR<TenantUpdateWithoutEnvironmentsInput, TenantUncheckedUpdateWithoutEnvironmentsInput>
    create: XOR<TenantCreateWithoutEnvironmentsInput, TenantUncheckedCreateWithoutEnvironmentsInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutEnvironmentsInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutEnvironmentsInput, TenantUncheckedUpdateWithoutEnvironmentsInput>
  }

  export type TenantUpdateWithoutEnvironmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    modifiedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    connectionId?: NullableStringFieldUpdateOperationsInput | string | null
    grantType?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientSecret?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    customer?: CustomerUpdateOneRequiredWithoutTenantsNestedInput
  }

  export type TenantUncheckedUpdateWithoutEnvironmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    customerId?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    modifiedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    connectionId?: NullableStringFieldUpdateOperationsInput | string | null
    grantType?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientSecret?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ExtensionUpsertWithWhereUniqueWithoutEnvironmentInput = {
    where: ExtensionWhereUniqueInput
    update: XOR<ExtensionUpdateWithoutEnvironmentInput, ExtensionUncheckedUpdateWithoutEnvironmentInput>
    create: XOR<ExtensionCreateWithoutEnvironmentInput, ExtensionUncheckedCreateWithoutEnvironmentInput>
  }

  export type ExtensionUpdateWithWhereUniqueWithoutEnvironmentInput = {
    where: ExtensionWhereUniqueInput
    data: XOR<ExtensionUpdateWithoutEnvironmentInput, ExtensionUncheckedUpdateWithoutEnvironmentInput>
  }

  export type ExtensionUpdateManyWithWhereWithoutEnvironmentInput = {
    where: ExtensionScalarWhereInput
    data: XOR<ExtensionUpdateManyMutationInput, ExtensionUncheckedUpdateManyWithoutEnvironmentInput>
  }

  export type ExtensionScalarWhereInput = {
    AND?: ExtensionScalarWhereInput | ExtensionScalarWhereInput[]
    OR?: ExtensionScalarWhereInput[]
    NOT?: ExtensionScalarWhereInput | ExtensionScalarWhereInput[]
    tenantId?: UuidFilter<"Extension"> | string
    environmentName?: StringFilter<"Extension"> | string
    id?: UuidFilter<"Extension"> | string
    name?: StringFilter<"Extension"> | string
    version?: StringFilter<"Extension"> | string
    publisher?: StringFilter<"Extension"> | string
    publishedAs?: StringFilter<"Extension"> | string
    state?: StringNullableFilter<"Extension"> | string | null
  }

  export type EnvironmentCreateWithoutExtensionsInput = {
    name: string
    type?: string | null
    status?: string | null
    webClientUrl?: string | null
    locationName?: string | null
    applicationVersion?: string | null
    platformVersion?: string | null
    tenant: TenantCreateNestedOneWithoutEnvironmentsInput
  }

  export type EnvironmentUncheckedCreateWithoutExtensionsInput = {
    tenantId: string
    name: string
    type?: string | null
    status?: string | null
    webClientUrl?: string | null
    locationName?: string | null
    applicationVersion?: string | null
    platformVersion?: string | null
  }

  export type EnvironmentCreateOrConnectWithoutExtensionsInput = {
    where: EnvironmentWhereUniqueInput
    create: XOR<EnvironmentCreateWithoutExtensionsInput, EnvironmentUncheckedCreateWithoutExtensionsInput>
  }

  export type EnvironmentUpsertWithoutExtensionsInput = {
    update: XOR<EnvironmentUpdateWithoutExtensionsInput, EnvironmentUncheckedUpdateWithoutExtensionsInput>
    create: XOR<EnvironmentCreateWithoutExtensionsInput, EnvironmentUncheckedCreateWithoutExtensionsInput>
    where?: EnvironmentWhereInput
  }

  export type EnvironmentUpdateToOneWithWhereWithoutExtensionsInput = {
    where?: EnvironmentWhereInput
    data: XOR<EnvironmentUpdateWithoutExtensionsInput, EnvironmentUncheckedUpdateWithoutExtensionsInput>
  }

  export type EnvironmentUpdateWithoutExtensionsInput = {
    name?: StringFieldUpdateOperationsInput | string
    type?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    webClientUrl?: NullableStringFieldUpdateOperationsInput | string | null
    locationName?: NullableStringFieldUpdateOperationsInput | string | null
    applicationVersion?: NullableStringFieldUpdateOperationsInput | string | null
    platformVersion?: NullableStringFieldUpdateOperationsInput | string | null
    tenant?: TenantUpdateOneRequiredWithoutEnvironmentsNestedInput
  }

  export type EnvironmentUncheckedUpdateWithoutExtensionsInput = {
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    webClientUrl?: NullableStringFieldUpdateOperationsInput | string | null
    locationName?: NullableStringFieldUpdateOperationsInput | string | null
    applicationVersion?: NullableStringFieldUpdateOperationsInput | string | null
    platformVersion?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserCustomerCreateManyUserInput = {
    customerId: string
    assignedAt?: Date | string
  }

  export type UserCustomerUpdateWithoutUserInput = {
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    customer?: CustomerUpdateOneRequiredWithoutAllowedUsersNestedInput
  }

  export type UserCustomerUncheckedUpdateWithoutUserInput = {
    customerId?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCustomerUncheckedUpdateManyWithoutUserInput = {
    customerId?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantCreateManyCustomerInput = {
    id: string
    description?: string | null
    createdAt: Date | string
    modifiedAt: Date | string
    connectionId?: string | null
    grantType?: string | null
    clientId?: string | null
    clientSecret?: string | null
    scope?: string | null
    token?: string | null
    tokenExpiresAt?: Date | string | null
  }

  export type UserCustomerCreateManyCustomerInput = {
    userId: string
    assignedAt?: Date | string
  }

  export type TenantUpdateWithoutCustomerInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    modifiedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    connectionId?: NullableStringFieldUpdateOperationsInput | string | null
    grantType?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientSecret?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    environments?: EnvironmentUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutCustomerInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    modifiedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    connectionId?: NullableStringFieldUpdateOperationsInput | string | null
    grantType?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientSecret?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    environments?: EnvironmentUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateManyWithoutCustomerInput = {
    id?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    modifiedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    connectionId?: NullableStringFieldUpdateOperationsInput | string | null
    grantType?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientSecret?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    token?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserCustomerUpdateWithoutCustomerInput = {
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutAllowedCustomersNestedInput
  }

  export type UserCustomerUncheckedUpdateWithoutCustomerInput = {
    userId?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCustomerUncheckedUpdateManyWithoutCustomerInput = {
    userId?: StringFieldUpdateOperationsInput | string
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EnvironmentCreateManyTenantInput = {
    name: string
    type?: string | null
    status?: string | null
    webClientUrl?: string | null
    locationName?: string | null
    applicationVersion?: string | null
    platformVersion?: string | null
  }

  export type EnvironmentUpdateWithoutTenantInput = {
    name?: StringFieldUpdateOperationsInput | string
    type?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    webClientUrl?: NullableStringFieldUpdateOperationsInput | string | null
    locationName?: NullableStringFieldUpdateOperationsInput | string | null
    applicationVersion?: NullableStringFieldUpdateOperationsInput | string | null
    platformVersion?: NullableStringFieldUpdateOperationsInput | string | null
    extensions?: ExtensionUpdateManyWithoutEnvironmentNestedInput
  }

  export type EnvironmentUncheckedUpdateWithoutTenantInput = {
    name?: StringFieldUpdateOperationsInput | string
    type?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    webClientUrl?: NullableStringFieldUpdateOperationsInput | string | null
    locationName?: NullableStringFieldUpdateOperationsInput | string | null
    applicationVersion?: NullableStringFieldUpdateOperationsInput | string | null
    platformVersion?: NullableStringFieldUpdateOperationsInput | string | null
    extensions?: ExtensionUncheckedUpdateManyWithoutEnvironmentNestedInput
  }

  export type EnvironmentUncheckedUpdateManyWithoutTenantInput = {
    name?: StringFieldUpdateOperationsInput | string
    type?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    webClientUrl?: NullableStringFieldUpdateOperationsInput | string | null
    locationName?: NullableStringFieldUpdateOperationsInput | string | null
    applicationVersion?: NullableStringFieldUpdateOperationsInput | string | null
    platformVersion?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExtensionCreateManyEnvironmentInput = {
    id: string
    name: string
    version: string
    publisher: string
    publishedAs: string
    state?: string | null
  }

  export type ExtensionUpdateWithoutEnvironmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    publisher?: StringFieldUpdateOperationsInput | string
    publishedAs?: StringFieldUpdateOperationsInput | string
    state?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExtensionUncheckedUpdateWithoutEnvironmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    publisher?: StringFieldUpdateOperationsInput | string
    publishedAs?: StringFieldUpdateOperationsInput | string
    state?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExtensionUncheckedUpdateManyWithoutEnvironmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    publisher?: StringFieldUpdateOperationsInput | string
    publishedAs?: StringFieldUpdateOperationsInput | string
    state?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}