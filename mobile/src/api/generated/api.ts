// @ts-nocheck
import {
  useMutation,
  useQuery
} from '@tanstack/react-query';
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  MutationFunction,
  QueryClient,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query';

import type {
  AddFoodEntryBody,
  AddSessionSetBody,
  CheckCredentialsBody,
  CreateExerciseBody,
  CreateFoodBody,
  CreatePresignedUpload200,
  CreatePresignedUploadBody,
  CreateWorkoutBody,
  DailyLog,
  Error,
  Exercise,
  Food,
  FoodEntry,
  GetDailyLogParams,
  GetMobileAuthMe200,
  GetMobileAuthMe401,
  ListFoodsParams,
  ListSessionsParams,
  ListWeightLogsParams,
  MobileLogin200,
  MobileLogin400,
  MobileLogin401,
  MobileLogin500,
  MobileLoginBody,
  MobileSignup201,
  MobileSignup400,
  MobileSignup409,
  MobileSignup500,
  MobileSignupBody,
  PublicUser,
  ScanLabelBody,
  SetLog,
  SignupWebBody,
  StartSessionBody,
  Success,
  UpdateExerciseBody,
  UpdateFoodBody,
  UpdateFoodEntryBody,
  UpdateSessionBody,
  UpdateSessionSetBody,
  UpdateSettingsBody,
  UpdateWorkoutBody,
  UpsertWeightLogBody,
  UserSettings,
  WeightLog,
  WorkoutSession,
  WorkoutSessionHistory,
  WorkoutTemplate
} from './schemas';

import { customFetch } from '../customFetch';
import type { ErrorType , BodyType } from '../customFetch';


type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];



export const getListFoodsUrl = (params?: ListFoodsParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {

    if (value !== undefined) {
      normalizedParams.append(key, value === null ? 'null' : String(value))
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0 ? `/api/foods?${stringifiedParams}` : `/api/foods`
}

/**
 * @summary List foods (shared library + user's custom), max 100
 */
export const listFoods = async (params?: ListFoodsParams, options?: RequestInit): Promise<Food[]> => {

  return customFetch<Food[]>(getListFoodsUrl(params),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListFoodsQueryKey = (params?: ListFoodsParams,) => {
    return [
    `/api/foods`, ...(params ? [params] : [])
    ] as const;
    }


export const getListFoodsQueryOptions = <TData = Awaited<ReturnType<typeof listFoods>>, TError = ErrorType<Error>>(params?: ListFoodsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listFoods>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListFoodsQueryKey(params);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listFoods>>> = ({ signal }) => listFoods(params, { signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listFoods>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListFoodsQueryResult = NonNullable<Awaited<ReturnType<typeof listFoods>>>
export type ListFoodsQueryError = ErrorType<Error>


export function useListFoods<TData = Awaited<ReturnType<typeof listFoods>>, TError = ErrorType<Error>>(
 params: undefined |  ListFoodsParams, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listFoods>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listFoods>>,
          TError,
          Awaited<ReturnType<typeof listFoods>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListFoods<TData = Awaited<ReturnType<typeof listFoods>>, TError = ErrorType<Error>>(
 params?: ListFoodsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listFoods>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listFoods>>,
          TError,
          Awaited<ReturnType<typeof listFoods>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListFoods<TData = Awaited<ReturnType<typeof listFoods>>, TError = ErrorType<Error>>(
 params?: ListFoodsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listFoods>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary List foods (shared library + user's custom), max 100
 */

export function useListFoods<TData = Awaited<ReturnType<typeof listFoods>>, TError = ErrorType<Error>>(
 params?: ListFoodsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listFoods>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListFoodsQueryOptions(params,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}







export const getCreateFoodUrl = () => {




  return `/api/foods`
}

/**
 * @summary Create a custom food
 */
export const createFood = async (createFoodBody: CreateFoodBody, options?: RequestInit): Promise<Food> => {

  return customFetch<Food>(getCreateFoodUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(createFoodBody)
  }
);}




export const getCreateFoodMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createFood>>, TError,{data: BodyType<CreateFoodBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof createFood>>, TError,{data: BodyType<CreateFoodBody>}, TContext> => {

const mutationKey = ['createFood'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof createFood>>, {data: BodyType<CreateFoodBody>}> = (props) => {
          const {data} = props ?? {};

          return  createFood(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type CreateFoodMutationResult = NonNullable<Awaited<ReturnType<typeof createFood>>>
    export type CreateFoodMutationBody = BodyType<CreateFoodBody>
    export type CreateFoodMutationError = ErrorType<Error>

    /**
 * @summary Create a custom food
 */
export const useCreateFood = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createFood>>, TError,{data: BodyType<CreateFoodBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof createFood>>,
        TError,
        {data: BodyType<CreateFoodBody>},
        TContext
      > => {
      return useMutation(getCreateFoodMutationOptions(options), queryClient);
    }

export const getUpdateFoodUrl = (id: string,) => {




  return `/api/foods/${id}`
}

/**
 * @summary Update a food (incl. presets)
 */
export const updateFood = async (id: string,
    updateFoodBody: UpdateFoodBody, options?: RequestInit): Promise<Food> => {

  return customFetch<Food>(getUpdateFoodUrl(id),
  {
    ...options,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(updateFoodBody)
  }
);}




export const getUpdateFoodMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateFood>>, TError,{id: string;data: BodyType<UpdateFoodBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof updateFood>>, TError,{id: string;data: BodyType<UpdateFoodBody>}, TContext> => {

const mutationKey = ['updateFood'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof updateFood>>, {id: string;data: BodyType<UpdateFoodBody>}> = (props) => {
          const {id,data} = props ?? {};

          return  updateFood(id,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type UpdateFoodMutationResult = NonNullable<Awaited<ReturnType<typeof updateFood>>>
    export type UpdateFoodMutationBody = BodyType<UpdateFoodBody>
    export type UpdateFoodMutationError = ErrorType<Error>

    /**
 * @summary Update a food (incl. presets)
 */
export const useUpdateFood = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateFood>>, TError,{id: string;data: BodyType<UpdateFoodBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof updateFood>>,
        TError,
        {id: string;data: BodyType<UpdateFoodBody>},
        TContext
      > => {
      return useMutation(getUpdateFoodMutationOptions(options), queryClient);
    }

export const getDeleteFoodUrl = (id: string,) => {




  return `/api/foods/${id}`
}

/**
 * @summary Delete a food
 */
export const deleteFood = async (id: string, options?: RequestInit): Promise<Success> => {

  return customFetch<Success>(getDeleteFoodUrl(id),
  {
    ...options,
    method: 'DELETE'


  }
);}




export const getDeleteFoodMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof deleteFood>>, TError,{id: string}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof deleteFood>>, TError,{id: string}, TContext> => {

const mutationKey = ['deleteFood'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof deleteFood>>, {id: string}> = (props) => {
          const {id} = props ?? {};

          return  deleteFood(id,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type DeleteFoodMutationResult = NonNullable<Awaited<ReturnType<typeof deleteFood>>>

    export type DeleteFoodMutationError = ErrorType<Error>

    /**
 * @summary Delete a food
 */
export const useDeleteFood = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof deleteFood>>, TError,{id: string}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof deleteFood>>,
        TError,
        {id: string},
        TContext
      > => {
      return useMutation(getDeleteFoodMutationOptions(options), queryClient);
    }

export const getGetDailyLogUrl = (params?: GetDailyLogParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {

    if (value !== undefined) {
      normalizedParams.append(key, value === null ? 'null' : String(value))
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0 ? `/api/daily-log?${stringifiedParams}` : `/api/daily-log`
}

/**
 * @summary Get (or create) the food log for a date
 */
export const getDailyLog = async (params?: GetDailyLogParams, options?: RequestInit): Promise<DailyLog> => {

  return customFetch<DailyLog>(getGetDailyLogUrl(params),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetDailyLogQueryKey = (params?: GetDailyLogParams,) => {
    return [
    `/api/daily-log`, ...(params ? [params] : [])
    ] as const;
    }


export const getGetDailyLogQueryOptions = <TData = Awaited<ReturnType<typeof getDailyLog>>, TError = ErrorType<Error>>(params?: GetDailyLogParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getDailyLog>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetDailyLogQueryKey(params);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getDailyLog>>> = ({ signal }) => getDailyLog(params, { signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getDailyLog>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetDailyLogQueryResult = NonNullable<Awaited<ReturnType<typeof getDailyLog>>>
export type GetDailyLogQueryError = ErrorType<Error>


export function useGetDailyLog<TData = Awaited<ReturnType<typeof getDailyLog>>, TError = ErrorType<Error>>(
 params: undefined |  GetDailyLogParams, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getDailyLog>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getDailyLog>>,
          TError,
          Awaited<ReturnType<typeof getDailyLog>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetDailyLog<TData = Awaited<ReturnType<typeof getDailyLog>>, TError = ErrorType<Error>>(
 params?: GetDailyLogParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getDailyLog>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getDailyLog>>,
          TError,
          Awaited<ReturnType<typeof getDailyLog>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetDailyLog<TData = Awaited<ReturnType<typeof getDailyLog>>, TError = ErrorType<Error>>(
 params?: GetDailyLogParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getDailyLog>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Get (or create) the food log for a date
 */

export function useGetDailyLog<TData = Awaited<ReturnType<typeof getDailyLog>>, TError = ErrorType<Error>>(
 params?: GetDailyLogParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getDailyLog>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetDailyLogQueryOptions(params,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}







export const getAddFoodEntryUrl = () => {




  return `/api/daily-log`
}

/**
 * @summary Add a food entry to a day
 */
export const addFoodEntry = async (addFoodEntryBody: AddFoodEntryBody, options?: RequestInit): Promise<FoodEntry> => {

  return customFetch<FoodEntry>(getAddFoodEntryUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(addFoodEntryBody)
  }
);}




export const getAddFoodEntryMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof addFoodEntry>>, TError,{data: BodyType<AddFoodEntryBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof addFoodEntry>>, TError,{data: BodyType<AddFoodEntryBody>}, TContext> => {

const mutationKey = ['addFoodEntry'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof addFoodEntry>>, {data: BodyType<AddFoodEntryBody>}> = (props) => {
          const {data} = props ?? {};

          return  addFoodEntry(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type AddFoodEntryMutationResult = NonNullable<Awaited<ReturnType<typeof addFoodEntry>>>
    export type AddFoodEntryMutationBody = BodyType<AddFoodEntryBody>
    export type AddFoodEntryMutationError = ErrorType<Error>

    /**
 * @summary Add a food entry to a day
 */
export const useAddFoodEntry = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof addFoodEntry>>, TError,{data: BodyType<AddFoodEntryBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof addFoodEntry>>,
        TError,
        {data: BodyType<AddFoodEntryBody>},
        TContext
      > => {
      return useMutation(getAddFoodEntryMutationOptions(options), queryClient);
    }

export const getUpdateFoodEntryUrl = (id: string,) => {




  return `/api/daily-log/${id}`
}

/**
 * @summary Update a food entry's multiplier/amount
 */
export const updateFoodEntry = async (id: string,
    updateFoodEntryBody: UpdateFoodEntryBody, options?: RequestInit): Promise<FoodEntry> => {

  return customFetch<FoodEntry>(getUpdateFoodEntryUrl(id),
  {
    ...options,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(updateFoodEntryBody)
  }
);}




export const getUpdateFoodEntryMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateFoodEntry>>, TError,{id: string;data: BodyType<UpdateFoodEntryBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof updateFoodEntry>>, TError,{id: string;data: BodyType<UpdateFoodEntryBody>}, TContext> => {

const mutationKey = ['updateFoodEntry'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof updateFoodEntry>>, {id: string;data: BodyType<UpdateFoodEntryBody>}> = (props) => {
          const {id,data} = props ?? {};

          return  updateFoodEntry(id,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type UpdateFoodEntryMutationResult = NonNullable<Awaited<ReturnType<typeof updateFoodEntry>>>
    export type UpdateFoodEntryMutationBody = BodyType<UpdateFoodEntryBody>
    export type UpdateFoodEntryMutationError = ErrorType<Error>

    /**
 * @summary Update a food entry's multiplier/amount
 */
export const useUpdateFoodEntry = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateFoodEntry>>, TError,{id: string;data: BodyType<UpdateFoodEntryBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof updateFoodEntry>>,
        TError,
        {id: string;data: BodyType<UpdateFoodEntryBody>},
        TContext
      > => {
      return useMutation(getUpdateFoodEntryMutationOptions(options), queryClient);
    }

export const getDeleteFoodEntryUrl = (id: string,) => {




  return `/api/daily-log/${id}`
}

/**
 * @summary Delete a food entry
 */
export const deleteFoodEntry = async (id: string, options?: RequestInit): Promise<Success> => {

  return customFetch<Success>(getDeleteFoodEntryUrl(id),
  {
    ...options,
    method: 'DELETE'


  }
);}




export const getDeleteFoodEntryMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof deleteFoodEntry>>, TError,{id: string}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof deleteFoodEntry>>, TError,{id: string}, TContext> => {

const mutationKey = ['deleteFoodEntry'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof deleteFoodEntry>>, {id: string}> = (props) => {
          const {id} = props ?? {};

          return  deleteFoodEntry(id,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type DeleteFoodEntryMutationResult = NonNullable<Awaited<ReturnType<typeof deleteFoodEntry>>>

    export type DeleteFoodEntryMutationError = ErrorType<Error>

    /**
 * @summary Delete a food entry
 */
export const useDeleteFoodEntry = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof deleteFoodEntry>>, TError,{id: string}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof deleteFoodEntry>>,
        TError,
        {id: string},
        TContext
      > => {
      return useMutation(getDeleteFoodEntryMutationOptions(options), queryClient);
    }

export const getGetSettingsUrl = () => {




  return `/api/settings`
}

/**
 * @summary Get (or create) user settings
 */
export const getSettings = async ( options?: RequestInit): Promise<UserSettings> => {

  return customFetch<UserSettings>(getGetSettingsUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetSettingsQueryKey = () => {
    return [
    `/api/settings`
    ] as const;
    }


export const getGetSettingsQueryOptions = <TData = Awaited<ReturnType<typeof getSettings>>, TError = ErrorType<Error>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetSettingsQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getSettings>>> = ({ signal }) => getSettings({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetSettingsQueryResult = NonNullable<Awaited<ReturnType<typeof getSettings>>>
export type GetSettingsQueryError = ErrorType<Error>


export function useGetSettings<TData = Awaited<ReturnType<typeof getSettings>>, TError = ErrorType<Error>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getSettings>>,
          TError,
          Awaited<ReturnType<typeof getSettings>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetSettings<TData = Awaited<ReturnType<typeof getSettings>>, TError = ErrorType<Error>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getSettings>>,
          TError,
          Awaited<ReturnType<typeof getSettings>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetSettings<TData = Awaited<ReturnType<typeof getSettings>>, TError = ErrorType<Error>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Get (or create) user settings
 */

export function useGetSettings<TData = Awaited<ReturnType<typeof getSettings>>, TError = ErrorType<Error>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetSettingsQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}







export const getUpdateSettingsUrl = () => {




  return `/api/settings`
}

/**
 * @summary Update user settings
 */
export const updateSettings = async (updateSettingsBody: UpdateSettingsBody, options?: RequestInit): Promise<UserSettings> => {

  return customFetch<UserSettings>(getUpdateSettingsUrl(),
  {
    ...options,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(updateSettingsBody)
  }
);}




export const getUpdateSettingsMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError,{data: BodyType<UpdateSettingsBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError,{data: BodyType<UpdateSettingsBody>}, TContext> => {

const mutationKey = ['updateSettings'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof updateSettings>>, {data: BodyType<UpdateSettingsBody>}> = (props) => {
          const {data} = props ?? {};

          return  updateSettings(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type UpdateSettingsMutationResult = NonNullable<Awaited<ReturnType<typeof updateSettings>>>
    export type UpdateSettingsMutationBody = BodyType<UpdateSettingsBody>
    export type UpdateSettingsMutationError = ErrorType<Error>

    /**
 * @summary Update user settings
 */
export const useUpdateSettings = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError,{data: BodyType<UpdateSettingsBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof updateSettings>>,
        TError,
        {data: BodyType<UpdateSettingsBody>},
        TContext
      > => {
      return useMutation(getUpdateSettingsMutationOptions(options), queryClient);
    }

export const getListWeightLogsUrl = (params?: ListWeightLogsParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {

    if (value !== undefined) {
      normalizedParams.append(key, value === null ? 'null' : String(value))
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0 ? `/api/weight-log?${stringifiedParams}` : `/api/weight-log`
}

/**
 * @summary List weight logs, newest first
 */
export const listWeightLogs = async (params?: ListWeightLogsParams, options?: RequestInit): Promise<WeightLog[]> => {

  return customFetch<WeightLog[]>(getListWeightLogsUrl(params),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListWeightLogsQueryKey = (params?: ListWeightLogsParams,) => {
    return [
    `/api/weight-log`, ...(params ? [params] : [])
    ] as const;
    }


export const getListWeightLogsQueryOptions = <TData = Awaited<ReturnType<typeof listWeightLogs>>, TError = ErrorType<Error>>(params?: ListWeightLogsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listWeightLogs>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListWeightLogsQueryKey(params);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listWeightLogs>>> = ({ signal }) => listWeightLogs(params, { signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listWeightLogs>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListWeightLogsQueryResult = NonNullable<Awaited<ReturnType<typeof listWeightLogs>>>
export type ListWeightLogsQueryError = ErrorType<Error>


export function useListWeightLogs<TData = Awaited<ReturnType<typeof listWeightLogs>>, TError = ErrorType<Error>>(
 params: undefined |  ListWeightLogsParams, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listWeightLogs>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listWeightLogs>>,
          TError,
          Awaited<ReturnType<typeof listWeightLogs>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListWeightLogs<TData = Awaited<ReturnType<typeof listWeightLogs>>, TError = ErrorType<Error>>(
 params?: ListWeightLogsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listWeightLogs>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listWeightLogs>>,
          TError,
          Awaited<ReturnType<typeof listWeightLogs>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListWeightLogs<TData = Awaited<ReturnType<typeof listWeightLogs>>, TError = ErrorType<Error>>(
 params?: ListWeightLogsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listWeightLogs>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary List weight logs, newest first
 */

export function useListWeightLogs<TData = Awaited<ReturnType<typeof listWeightLogs>>, TError = ErrorType<Error>>(
 params?: ListWeightLogsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listWeightLogs>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListWeightLogsQueryOptions(params,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}







export const getUpsertWeightLogUrl = () => {




  return `/api/weight-log`
}

/**
 * @summary Record weight for a date
 */
export const upsertWeightLog = async (upsertWeightLogBody: UpsertWeightLogBody, options?: RequestInit): Promise<WeightLog> => {

  return customFetch<WeightLog>(getUpsertWeightLogUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(upsertWeightLogBody)
  }
);}




export const getUpsertWeightLogMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof upsertWeightLog>>, TError,{data: BodyType<UpsertWeightLogBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof upsertWeightLog>>, TError,{data: BodyType<UpsertWeightLogBody>}, TContext> => {

const mutationKey = ['upsertWeightLog'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof upsertWeightLog>>, {data: BodyType<UpsertWeightLogBody>}> = (props) => {
          const {data} = props ?? {};

          return  upsertWeightLog(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type UpsertWeightLogMutationResult = NonNullable<Awaited<ReturnType<typeof upsertWeightLog>>>
    export type UpsertWeightLogMutationBody = BodyType<UpsertWeightLogBody>
    export type UpsertWeightLogMutationError = ErrorType<Error>

    /**
 * @summary Record weight for a date
 */
export const useUpsertWeightLog = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof upsertWeightLog>>, TError,{data: BodyType<UpsertWeightLogBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof upsertWeightLog>>,
        TError,
        {data: BodyType<UpsertWeightLogBody>},
        TContext
      > => {
      return useMutation(getUpsertWeightLogMutationOptions(options), queryClient);
    }

export const getListExercisesUrl = () => {




  return `/api/exercises`
}

/**
 * @summary List exercises (library + custom)
 */
export const listExercises = async ( options?: RequestInit): Promise<Exercise[]> => {

  return customFetch<Exercise[]>(getListExercisesUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListExercisesQueryKey = () => {
    return [
    `/api/exercises`
    ] as const;
    }


export const getListExercisesQueryOptions = <TData = Awaited<ReturnType<typeof listExercises>>, TError = ErrorType<Error>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listExercises>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListExercisesQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listExercises>>> = ({ signal }) => listExercises({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listExercises>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListExercisesQueryResult = NonNullable<Awaited<ReturnType<typeof listExercises>>>
export type ListExercisesQueryError = ErrorType<Error>


export function useListExercises<TData = Awaited<ReturnType<typeof listExercises>>, TError = ErrorType<Error>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listExercises>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listExercises>>,
          TError,
          Awaited<ReturnType<typeof listExercises>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListExercises<TData = Awaited<ReturnType<typeof listExercises>>, TError = ErrorType<Error>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listExercises>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listExercises>>,
          TError,
          Awaited<ReturnType<typeof listExercises>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListExercises<TData = Awaited<ReturnType<typeof listExercises>>, TError = ErrorType<Error>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listExercises>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary List exercises (library + custom)
 */

export function useListExercises<TData = Awaited<ReturnType<typeof listExercises>>, TError = ErrorType<Error>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listExercises>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListExercisesQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}







export const getCreateExerciseUrl = () => {




  return `/api/exercises`
}

/**
 * @summary Create a custom exercise
 */
export const createExercise = async (createExerciseBody: CreateExerciseBody, options?: RequestInit): Promise<Exercise> => {

  return customFetch<Exercise>(getCreateExerciseUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(createExerciseBody)
  }
);}




export const getCreateExerciseMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createExercise>>, TError,{data: BodyType<CreateExerciseBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof createExercise>>, TError,{data: BodyType<CreateExerciseBody>}, TContext> => {

const mutationKey = ['createExercise'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof createExercise>>, {data: BodyType<CreateExerciseBody>}> = (props) => {
          const {data} = props ?? {};

          return  createExercise(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type CreateExerciseMutationResult = NonNullable<Awaited<ReturnType<typeof createExercise>>>
    export type CreateExerciseMutationBody = BodyType<CreateExerciseBody>
    export type CreateExerciseMutationError = ErrorType<Error>

    /**
 * @summary Create a custom exercise
 */
export const useCreateExercise = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createExercise>>, TError,{data: BodyType<CreateExerciseBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof createExercise>>,
        TError,
        {data: BodyType<CreateExerciseBody>},
        TContext
      > => {
      return useMutation(getCreateExerciseMutationOptions(options), queryClient);
    }

export const getUpdateExerciseUrl = (id: string,) => {




  return `/api/exercises/${id}`
}

/**
 * @summary Update an exercise (incl. restSeconds)
 */
export const updateExercise = async (id: string,
    updateExerciseBody: UpdateExerciseBody, options?: RequestInit): Promise<Exercise> => {

  return customFetch<Exercise>(getUpdateExerciseUrl(id),
  {
    ...options,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(updateExerciseBody)
  }
);}




export const getUpdateExerciseMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateExercise>>, TError,{id: string;data: BodyType<UpdateExerciseBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof updateExercise>>, TError,{id: string;data: BodyType<UpdateExerciseBody>}, TContext> => {

const mutationKey = ['updateExercise'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof updateExercise>>, {id: string;data: BodyType<UpdateExerciseBody>}> = (props) => {
          const {id,data} = props ?? {};

          return  updateExercise(id,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type UpdateExerciseMutationResult = NonNullable<Awaited<ReturnType<typeof updateExercise>>>
    export type UpdateExerciseMutationBody = BodyType<UpdateExerciseBody>
    export type UpdateExerciseMutationError = ErrorType<Error>

    /**
 * @summary Update an exercise (incl. restSeconds)
 */
export const useUpdateExercise = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateExercise>>, TError,{id: string;data: BodyType<UpdateExerciseBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof updateExercise>>,
        TError,
        {id: string;data: BodyType<UpdateExerciseBody>},
        TContext
      > => {
      return useMutation(getUpdateExerciseMutationOptions(options), queryClient);
    }

export const getDeleteExerciseUrl = (id: string,) => {




  return `/api/exercises/${id}`
}

/**
 * @summary Delete an exercise
 */
export const deleteExercise = async (id: string, options?: RequestInit): Promise<Success> => {

  return customFetch<Success>(getDeleteExerciseUrl(id),
  {
    ...options,
    method: 'DELETE'


  }
);}




export const getDeleteExerciseMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof deleteExercise>>, TError,{id: string}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof deleteExercise>>, TError,{id: string}, TContext> => {

const mutationKey = ['deleteExercise'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof deleteExercise>>, {id: string}> = (props) => {
          const {id} = props ?? {};

          return  deleteExercise(id,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type DeleteExerciseMutationResult = NonNullable<Awaited<ReturnType<typeof deleteExercise>>>

    export type DeleteExerciseMutationError = ErrorType<Error>

    /**
 * @summary Delete an exercise
 */
export const useDeleteExercise = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof deleteExercise>>, TError,{id: string}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof deleteExercise>>,
        TError,
        {id: string},
        TContext
      > => {
      return useMutation(getDeleteExerciseMutationOptions(options), queryClient);
    }

export const getListWorkoutsUrl = () => {




  return `/api/workouts`
}

/**
 * @summary List workout templates
 */
export const listWorkouts = async ( options?: RequestInit): Promise<WorkoutTemplate[]> => {

  return customFetch<WorkoutTemplate[]>(getListWorkoutsUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListWorkoutsQueryKey = () => {
    return [
    `/api/workouts`
    ] as const;
    }


export const getListWorkoutsQueryOptions = <TData = Awaited<ReturnType<typeof listWorkouts>>, TError = ErrorType<Error>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listWorkouts>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListWorkoutsQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listWorkouts>>> = ({ signal }) => listWorkouts({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listWorkouts>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListWorkoutsQueryResult = NonNullable<Awaited<ReturnType<typeof listWorkouts>>>
export type ListWorkoutsQueryError = ErrorType<Error>


export function useListWorkouts<TData = Awaited<ReturnType<typeof listWorkouts>>, TError = ErrorType<Error>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listWorkouts>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listWorkouts>>,
          TError,
          Awaited<ReturnType<typeof listWorkouts>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListWorkouts<TData = Awaited<ReturnType<typeof listWorkouts>>, TError = ErrorType<Error>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listWorkouts>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listWorkouts>>,
          TError,
          Awaited<ReturnType<typeof listWorkouts>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListWorkouts<TData = Awaited<ReturnType<typeof listWorkouts>>, TError = ErrorType<Error>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listWorkouts>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary List workout templates
 */

export function useListWorkouts<TData = Awaited<ReturnType<typeof listWorkouts>>, TError = ErrorType<Error>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listWorkouts>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListWorkoutsQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}







export const getCreateWorkoutUrl = () => {




  return `/api/workouts`
}

/**
 * @summary Create a workout template
 */
export const createWorkout = async (createWorkoutBody: CreateWorkoutBody, options?: RequestInit): Promise<WorkoutTemplate> => {

  return customFetch<WorkoutTemplate>(getCreateWorkoutUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(createWorkoutBody)
  }
);}




export const getCreateWorkoutMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createWorkout>>, TError,{data: BodyType<CreateWorkoutBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof createWorkout>>, TError,{data: BodyType<CreateWorkoutBody>}, TContext> => {

const mutationKey = ['createWorkout'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof createWorkout>>, {data: BodyType<CreateWorkoutBody>}> = (props) => {
          const {data} = props ?? {};

          return  createWorkout(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type CreateWorkoutMutationResult = NonNullable<Awaited<ReturnType<typeof createWorkout>>>
    export type CreateWorkoutMutationBody = BodyType<CreateWorkoutBody>
    export type CreateWorkoutMutationError = ErrorType<Error>

    /**
 * @summary Create a workout template
 */
export const useCreateWorkout = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createWorkout>>, TError,{data: BodyType<CreateWorkoutBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof createWorkout>>,
        TError,
        {data: BodyType<CreateWorkoutBody>},
        TContext
      > => {
      return useMutation(getCreateWorkoutMutationOptions(options), queryClient);
    }

export const getGetWorkoutUrl = (id: string,) => {




  return `/api/workouts/${id}`
}

/**
 * @summary Get a workout template
 */
export const getWorkout = async (id: string, options?: RequestInit): Promise<WorkoutTemplate> => {

  return customFetch<WorkoutTemplate>(getGetWorkoutUrl(id),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetWorkoutQueryKey = (id: string,) => {
    return [
    `/api/workouts/${id}`
    ] as const;
    }


export const getGetWorkoutQueryOptions = <TData = Awaited<ReturnType<typeof getWorkout>>, TError = ErrorType<Error>>(id: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getWorkout>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetWorkoutQueryKey(id);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getWorkout>>> = ({ signal }) => getWorkout(id, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: id !== null && id !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getWorkout>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetWorkoutQueryResult = NonNullable<Awaited<ReturnType<typeof getWorkout>>>
export type GetWorkoutQueryError = ErrorType<Error>


export function useGetWorkout<TData = Awaited<ReturnType<typeof getWorkout>>, TError = ErrorType<Error>>(
 id: string, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getWorkout>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getWorkout>>,
          TError,
          Awaited<ReturnType<typeof getWorkout>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetWorkout<TData = Awaited<ReturnType<typeof getWorkout>>, TError = ErrorType<Error>>(
 id: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getWorkout>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getWorkout>>,
          TError,
          Awaited<ReturnType<typeof getWorkout>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetWorkout<TData = Awaited<ReturnType<typeof getWorkout>>, TError = ErrorType<Error>>(
 id: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getWorkout>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Get a workout template
 */

export function useGetWorkout<TData = Awaited<ReturnType<typeof getWorkout>>, TError = ErrorType<Error>>(
 id: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getWorkout>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetWorkoutQueryOptions(id,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}







export const getUpdateWorkoutUrl = (id: string,) => {




  return `/api/workouts/${id}`
}

/**
 * @summary Replace a workout template's name/exercises
 */
export const updateWorkout = async (id: string,
    updateWorkoutBody: UpdateWorkoutBody, options?: RequestInit): Promise<WorkoutTemplate> => {

  return customFetch<WorkoutTemplate>(getUpdateWorkoutUrl(id),
  {
    ...options,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(updateWorkoutBody)
  }
);}




export const getUpdateWorkoutMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateWorkout>>, TError,{id: string;data: BodyType<UpdateWorkoutBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof updateWorkout>>, TError,{id: string;data: BodyType<UpdateWorkoutBody>}, TContext> => {

const mutationKey = ['updateWorkout'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof updateWorkout>>, {id: string;data: BodyType<UpdateWorkoutBody>}> = (props) => {
          const {id,data} = props ?? {};

          return  updateWorkout(id,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type UpdateWorkoutMutationResult = NonNullable<Awaited<ReturnType<typeof updateWorkout>>>
    export type UpdateWorkoutMutationBody = BodyType<UpdateWorkoutBody>
    export type UpdateWorkoutMutationError = ErrorType<Error>

    /**
 * @summary Replace a workout template's name/exercises
 */
export const useUpdateWorkout = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateWorkout>>, TError,{id: string;data: BodyType<UpdateWorkoutBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof updateWorkout>>,
        TError,
        {id: string;data: BodyType<UpdateWorkoutBody>},
        TContext
      > => {
      return useMutation(getUpdateWorkoutMutationOptions(options), queryClient);
    }

export const getDeleteWorkoutUrl = (id: string,) => {




  return `/api/workouts/${id}`
}

/**
 * @summary Delete a workout template
 */
export const deleteWorkout = async (id: string, options?: RequestInit): Promise<Success> => {

  return customFetch<Success>(getDeleteWorkoutUrl(id),
  {
    ...options,
    method: 'DELETE'


  }
);}




export const getDeleteWorkoutMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof deleteWorkout>>, TError,{id: string}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof deleteWorkout>>, TError,{id: string}, TContext> => {

const mutationKey = ['deleteWorkout'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof deleteWorkout>>, {id: string}> = (props) => {
          const {id} = props ?? {};

          return  deleteWorkout(id,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type DeleteWorkoutMutationResult = NonNullable<Awaited<ReturnType<typeof deleteWorkout>>>

    export type DeleteWorkoutMutationError = ErrorType<Error>

    /**
 * @summary Delete a workout template
 */
export const useDeleteWorkout = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof deleteWorkout>>, TError,{id: string}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof deleteWorkout>>,
        TError,
        {id: string},
        TContext
      > => {
      return useMutation(getDeleteWorkoutMutationOptions(options), queryClient);
    }

export const getListSessionsUrl = (params?: ListSessionsParams,) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {

    if (value !== undefined) {
      normalizedParams.append(key, value === null ? 'null' : String(value))
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0 ? `/api/sessions?${stringifiedParams}` : `/api/sessions`
}

/**
 * @summary List finished workout sessions (history)
 */
export const listSessions = async (params?: ListSessionsParams, options?: RequestInit): Promise<WorkoutSessionHistory[]> => {

  return customFetch<WorkoutSessionHistory[]>(getListSessionsUrl(params),
  {
    ...options,
    method: 'GET'


  }
);}





export const getListSessionsQueryKey = (params?: ListSessionsParams,) => {
    return [
    `/api/sessions`, ...(params ? [params] : [])
    ] as const;
    }


export const getListSessionsQueryOptions = <TData = Awaited<ReturnType<typeof listSessions>>, TError = ErrorType<Error>>(params?: ListSessionsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listSessions>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListSessionsQueryKey(params);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof listSessions>>> = ({ signal }) => listSessions(params, { signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listSessions>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListSessionsQueryResult = NonNullable<Awaited<ReturnType<typeof listSessions>>>
export type ListSessionsQueryError = ErrorType<Error>


export function useListSessions<TData = Awaited<ReturnType<typeof listSessions>>, TError = ErrorType<Error>>(
 params: undefined |  ListSessionsParams, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listSessions>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listSessions>>,
          TError,
          Awaited<ReturnType<typeof listSessions>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListSessions<TData = Awaited<ReturnType<typeof listSessions>>, TError = ErrorType<Error>>(
 params?: ListSessionsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listSessions>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listSessions>>,
          TError,
          Awaited<ReturnType<typeof listSessions>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListSessions<TData = Awaited<ReturnType<typeof listSessions>>, TError = ErrorType<Error>>(
 params?: ListSessionsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listSessions>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary List finished workout sessions (history)
 */

export function useListSessions<TData = Awaited<ReturnType<typeof listSessions>>, TError = ErrorType<Error>>(
 params?: ListSessionsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listSessions>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListSessionsQueryOptions(params,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}







export const getStartSessionUrl = () => {




  return `/api/sessions`
}

/**
 * @summary Start a workout session (optionally from a template)
 */
export const startSession = async (startSessionBody: StartSessionBody, options?: RequestInit): Promise<WorkoutSession> => {

  return customFetch<WorkoutSession>(getStartSessionUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(startSessionBody)
  }
);}




export const getStartSessionMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof startSession>>, TError,{data: BodyType<StartSessionBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof startSession>>, TError,{data: BodyType<StartSessionBody>}, TContext> => {

const mutationKey = ['startSession'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof startSession>>, {data: BodyType<StartSessionBody>}> = (props) => {
          const {data} = props ?? {};

          return  startSession(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type StartSessionMutationResult = NonNullable<Awaited<ReturnType<typeof startSession>>>
    export type StartSessionMutationBody = BodyType<StartSessionBody>
    export type StartSessionMutationError = ErrorType<Error>

    /**
 * @summary Start a workout session (optionally from a template)
 */
export const useStartSession = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof startSession>>, TError,{data: BodyType<StartSessionBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof startSession>>,
        TError,
        {data: BodyType<StartSessionBody>},
        TContext
      > => {
      return useMutation(getStartSessionMutationOptions(options), queryClient);
    }

export const getGetSessionUrl = (id: string,) => {




  return `/api/sessions/${id}`
}

/**
 * @summary Get a workout session
 */
export const getSession = async (id: string, options?: RequestInit): Promise<WorkoutSession> => {

  return customFetch<WorkoutSession>(getGetSessionUrl(id),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetSessionQueryKey = (id: string,) => {
    return [
    `/api/sessions/${id}`
    ] as const;
    }


export const getGetSessionQueryOptions = <TData = Awaited<ReturnType<typeof getSession>>, TError = ErrorType<Error>>(id: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSession>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetSessionQueryKey(id);



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getSession>>> = ({ signal }) => getSession(id, { signal, ...requestOptions });





   return  { queryKey, queryFn, enabled: id !== null && id !== undefined, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getSession>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetSessionQueryResult = NonNullable<Awaited<ReturnType<typeof getSession>>>
export type GetSessionQueryError = ErrorType<Error>


export function useGetSession<TData = Awaited<ReturnType<typeof getSession>>, TError = ErrorType<Error>>(
 id: string, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSession>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getSession>>,
          TError,
          Awaited<ReturnType<typeof getSession>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetSession<TData = Awaited<ReturnType<typeof getSession>>, TError = ErrorType<Error>>(
 id: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSession>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getSession>>,
          TError,
          Awaited<ReturnType<typeof getSession>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetSession<TData = Awaited<ReturnType<typeof getSession>>, TError = ErrorType<Error>>(
 id: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSession>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Get a workout session
 */

export function useGetSession<TData = Awaited<ReturnType<typeof getSession>>, TError = ErrorType<Error>>(
 id: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getSession>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetSessionQueryOptions(id,options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}







export const getUpdateSessionUrl = (id: string,) => {




  return `/api/sessions/${id}`
}

/**
 * @summary Update/finish a session and bulk-update sets
 */
export const updateSession = async (id: string,
    updateSessionBody: UpdateSessionBody, options?: RequestInit): Promise<WorkoutSession> => {

  return customFetch<WorkoutSession>(getUpdateSessionUrl(id),
  {
    ...options,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(updateSessionBody)
  }
);}




export const getUpdateSessionMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateSession>>, TError,{id: string;data: BodyType<UpdateSessionBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof updateSession>>, TError,{id: string;data: BodyType<UpdateSessionBody>}, TContext> => {

const mutationKey = ['updateSession'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof updateSession>>, {id: string;data: BodyType<UpdateSessionBody>}> = (props) => {
          const {id,data} = props ?? {};

          return  updateSession(id,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type UpdateSessionMutationResult = NonNullable<Awaited<ReturnType<typeof updateSession>>>
    export type UpdateSessionMutationBody = BodyType<UpdateSessionBody>
    export type UpdateSessionMutationError = ErrorType<Error>

    /**
 * @summary Update/finish a session and bulk-update sets
 */
export const useUpdateSession = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateSession>>, TError,{id: string;data: BodyType<UpdateSessionBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof updateSession>>,
        TError,
        {id: string;data: BodyType<UpdateSessionBody>},
        TContext
      > => {
      return useMutation(getUpdateSessionMutationOptions(options), queryClient);
    }

export const getDeleteSessionUrl = (id: string,) => {




  return `/api/sessions/${id}`
}

/**
 * @summary Delete a session
 */
export const deleteSession = async (id: string, options?: RequestInit): Promise<Success> => {

  return customFetch<Success>(getDeleteSessionUrl(id),
  {
    ...options,
    method: 'DELETE'


  }
);}




export const getDeleteSessionMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof deleteSession>>, TError,{id: string}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof deleteSession>>, TError,{id: string}, TContext> => {

const mutationKey = ['deleteSession'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof deleteSession>>, {id: string}> = (props) => {
          const {id} = props ?? {};

          return  deleteSession(id,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type DeleteSessionMutationResult = NonNullable<Awaited<ReturnType<typeof deleteSession>>>

    export type DeleteSessionMutationError = ErrorType<Error>

    /**
 * @summary Delete a session
 */
export const useDeleteSession = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof deleteSession>>, TError,{id: string}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof deleteSession>>,
        TError,
        {id: string},
        TContext
      > => {
      return useMutation(getDeleteSessionMutationOptions(options), queryClient);
    }

export const getAddSessionSetUrl = (id: string,) => {




  return `/api/sessions/${id}/sets`
}

/**
 * @summary Add a set to a session
 */
export const addSessionSet = async (id: string,
    addSessionSetBody: AddSessionSetBody, options?: RequestInit): Promise<SetLog> => {

  return customFetch<SetLog>(getAddSessionSetUrl(id),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(addSessionSetBody)
  }
);}




export const getAddSessionSetMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof addSessionSet>>, TError,{id: string;data: BodyType<AddSessionSetBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof addSessionSet>>, TError,{id: string;data: BodyType<AddSessionSetBody>}, TContext> => {

const mutationKey = ['addSessionSet'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof addSessionSet>>, {id: string;data: BodyType<AddSessionSetBody>}> = (props) => {
          const {id,data} = props ?? {};

          return  addSessionSet(id,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type AddSessionSetMutationResult = NonNullable<Awaited<ReturnType<typeof addSessionSet>>>
    export type AddSessionSetMutationBody = BodyType<AddSessionSetBody>
    export type AddSessionSetMutationError = ErrorType<Error>

    /**
 * @summary Add a set to a session
 */
export const useAddSessionSet = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof addSessionSet>>, TError,{id: string;data: BodyType<AddSessionSetBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof addSessionSet>>,
        TError,
        {id: string;data: BodyType<AddSessionSetBody>},
        TContext
      > => {
      return useMutation(getAddSessionSetMutationOptions(options), queryClient);
    }

export const getUpdateSessionSetUrl = (id: string,) => {




  return `/api/sessions/${id}/sets`
}

/**
 * @summary Update a single set
 */
export const updateSessionSet = async (id: string,
    updateSessionSetBody: UpdateSessionSetBody, options?: RequestInit): Promise<SetLog> => {

  return customFetch<SetLog>(getUpdateSessionSetUrl(id),
  {
    ...options,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(updateSessionSetBody)
  }
);}




export const getUpdateSessionSetMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateSessionSet>>, TError,{id: string;data: BodyType<UpdateSessionSetBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof updateSessionSet>>, TError,{id: string;data: BodyType<UpdateSessionSetBody>}, TContext> => {

const mutationKey = ['updateSessionSet'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof updateSessionSet>>, {id: string;data: BodyType<UpdateSessionSetBody>}> = (props) => {
          const {id,data} = props ?? {};

          return  updateSessionSet(id,data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type UpdateSessionSetMutationResult = NonNullable<Awaited<ReturnType<typeof updateSessionSet>>>
    export type UpdateSessionSetMutationBody = BodyType<UpdateSessionSetBody>
    export type UpdateSessionSetMutationError = ErrorType<Error>

    /**
 * @summary Update a single set
 */
export const useUpdateSessionSet = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateSessionSet>>, TError,{id: string;data: BodyType<UpdateSessionSetBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof updateSessionSet>>,
        TError,
        {id: string;data: BodyType<UpdateSessionSetBody>},
        TContext
      > => {
      return useMutation(getUpdateSessionSetMutationOptions(options), queryClient);
    }

export const getScanLabelUrl = () => {




  return `/api/scan-label`
}

/**
 * @summary AI nutrition label extraction from a photo (Server-Sent Events stream)
 */
export const scanLabel = async (scanLabelBody: ScanLabelBody, options?: RequestInit): Promise<string> => {
    const formData = new FormData();
formData.append(`image`, scanLabelBody.image);

  return customFetch<string>(getScanLabelUrl(),
  {
    ...options,
    method: 'POST'
    ,
    body: formData
  }
);}




export const getScanLabelMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof scanLabel>>, TError,{data: BodyType<ScanLabelBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof scanLabel>>, TError,{data: BodyType<ScanLabelBody>}, TContext> => {

const mutationKey = ['scanLabel'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof scanLabel>>, {data: BodyType<ScanLabelBody>}> = (props) => {
          const {data} = props ?? {};

          return  scanLabel(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type ScanLabelMutationResult = NonNullable<Awaited<ReturnType<typeof scanLabel>>>
    export type ScanLabelMutationBody = BodyType<ScanLabelBody>
    export type ScanLabelMutationError = ErrorType<Error>

    /**
 * @summary AI nutrition label extraction from a photo (Server-Sent Events stream)
 */
export const useScanLabel = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof scanLabel>>, TError,{data: BodyType<ScanLabelBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof scanLabel>>,
        TError,
        {data: BodyType<ScanLabelBody>},
        TContext
      > => {
      return useMutation(getScanLabelMutationOptions(options), queryClient);
    }

export const getCreatePresignedUploadUrl = () => {




  return `/api/upload/presigned`
}

/**
 * @summary Get a presigned upload URL for cloud storage
 */
export const createPresignedUpload = async (createPresignedUploadBody: CreatePresignedUploadBody, options?: RequestInit): Promise<CreatePresignedUpload200> => {

  return customFetch<CreatePresignedUpload200>(getCreatePresignedUploadUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(createPresignedUploadBody)
  }
);}




export const getCreatePresignedUploadMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createPresignedUpload>>, TError,{data: BodyType<CreatePresignedUploadBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof createPresignedUpload>>, TError,{data: BodyType<CreatePresignedUploadBody>}, TContext> => {

const mutationKey = ['createPresignedUpload'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof createPresignedUpload>>, {data: BodyType<CreatePresignedUploadBody>}> = (props) => {
          const {data} = props ?? {};

          return  createPresignedUpload(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type CreatePresignedUploadMutationResult = NonNullable<Awaited<ReturnType<typeof createPresignedUpload>>>
    export type CreatePresignedUploadMutationBody = BodyType<CreatePresignedUploadBody>
    export type CreatePresignedUploadMutationError = ErrorType<Error>

    /**
 * @summary Get a presigned upload URL for cloud storage
 */
export const useCreatePresignedUpload = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createPresignedUpload>>, TError,{data: BodyType<CreatePresignedUploadBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof createPresignedUpload>>,
        TError,
        {data: BodyType<CreatePresignedUploadBody>},
        TContext
      > => {
      return useMutation(getCreatePresignedUploadMutationOptions(options), queryClient);
    }

export const getSignupWebUrl = () => {




  return `/api/signup`
}

/**
 * @summary Create an email/password account (web; mobile should use /api/mobile-auth/signup)
 */
export const signupWeb = async (signupWebBody: SignupWebBody, options?: RequestInit): Promise<PublicUser> => {

  return customFetch<PublicUser>(getSignupWebUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(signupWebBody)
  }
);}




export const getSignupWebMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof signupWeb>>, TError,{data: BodyType<SignupWebBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof signupWeb>>, TError,{data: BodyType<SignupWebBody>}, TContext> => {

const mutationKey = ['signupWeb'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof signupWeb>>, {data: BodyType<SignupWebBody>}> = (props) => {
          const {data} = props ?? {};

          return  signupWeb(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type SignupWebMutationResult = NonNullable<Awaited<ReturnType<typeof signupWeb>>>
    export type SignupWebMutationBody = BodyType<SignupWebBody>
    export type SignupWebMutationError = ErrorType<Error>

    /**
 * @summary Create an email/password account (web; mobile should use /api/mobile-auth/signup)
 */
export const useSignupWeb = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof signupWeb>>, TError,{data: BodyType<SignupWebBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof signupWeb>>,
        TError,
        {data: BodyType<SignupWebBody>},
        TContext
      > => {
      return useMutation(getSignupWebMutationOptions(options), queryClient);
    }

export const getCheckCredentialsUrl = () => {




  return `/api/auth/login`
}

/**
 * @summary Validate email/password (no session issued; mobile should use /api/mobile-auth/login)
 */
export const checkCredentials = async (checkCredentialsBody: CheckCredentialsBody, options?: RequestInit): Promise<PublicUser> => {

  return customFetch<PublicUser>(getCheckCredentialsUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(checkCredentialsBody)
  }
);}




export const getCheckCredentialsMutationOptions = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof checkCredentials>>, TError,{data: BodyType<CheckCredentialsBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof checkCredentials>>, TError,{data: BodyType<CheckCredentialsBody>}, TContext> => {

const mutationKey = ['checkCredentials'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof checkCredentials>>, {data: BodyType<CheckCredentialsBody>}> = (props) => {
          const {data} = props ?? {};

          return  checkCredentials(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type CheckCredentialsMutationResult = NonNullable<Awaited<ReturnType<typeof checkCredentials>>>
    export type CheckCredentialsMutationBody = BodyType<CheckCredentialsBody>
    export type CheckCredentialsMutationError = ErrorType<Error>

    /**
 * @summary Validate email/password (no session issued; mobile should use /api/mobile-auth/login)
 */
export const useCheckCredentials = <TError = ErrorType<Error>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof checkCredentials>>, TError,{data: BodyType<CheckCredentialsBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof checkCredentials>>,
        TError,
        {data: BodyType<CheckCredentialsBody>},
        TContext
      > => {
      return useMutation(getCheckCredentialsMutationOptions(options), queryClient);
    }

export const getMobileSignupUrl = () => {




  return `/api/mobile-auth/signup`
}

/**
 * @summary Create an account and return a bearer token.
 */
export const mobileSignup = async (mobileSignupBody: MobileSignupBody, options?: RequestInit): Promise<MobileSignup201> => {

  return customFetch<MobileSignup201>(getMobileSignupUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(mobileSignupBody)
  }
);}




export const getMobileSignupMutationOptions = <TError = ErrorType<MobileSignup400 | MobileSignup409 | MobileSignup500>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof mobileSignup>>, TError,{data: BodyType<MobileSignupBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof mobileSignup>>, TError,{data: BodyType<MobileSignupBody>}, TContext> => {

const mutationKey = ['mobileSignup'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof mobileSignup>>, {data: BodyType<MobileSignupBody>}> = (props) => {
          const {data} = props ?? {};

          return  mobileSignup(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type MobileSignupMutationResult = NonNullable<Awaited<ReturnType<typeof mobileSignup>>>
    export type MobileSignupMutationBody = BodyType<MobileSignupBody>
    export type MobileSignupMutationError = ErrorType<MobileSignup400 | MobileSignup409 | MobileSignup500>

    /**
 * @summary Create an account and return a bearer token.
 */
export const useMobileSignup = <TError = ErrorType<MobileSignup400 | MobileSignup409 | MobileSignup500>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof mobileSignup>>, TError,{data: BodyType<MobileSignupBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof mobileSignup>>,
        TError,
        {data: BodyType<MobileSignupBody>},
        TContext
      > => {
      return useMutation(getMobileSignupMutationOptions(options), queryClient);
    }

export const getMobileLoginUrl = () => {




  return `/api/mobile-auth/login`
}

/**
 * @summary Exchange credentials for a bearer token.
 */
export const mobileLogin = async (mobileLoginBody: MobileLoginBody, options?: RequestInit): Promise<MobileLogin200> => {

  return customFetch<MobileLogin200>(getMobileLoginUrl(),
  {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(mobileLoginBody)
  }
);}




export const getMobileLoginMutationOptions = <TError = ErrorType<MobileLogin400 | MobileLogin401 | MobileLogin500>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof mobileLogin>>, TError,{data: BodyType<MobileLoginBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
): UseMutationOptions<Awaited<ReturnType<typeof mobileLogin>>, TError,{data: BodyType<MobileLoginBody>}, TContext> => {

const mutationKey = ['mobileLogin'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};




      const mutationFn: MutationFunction<Awaited<ReturnType<typeof mobileLogin>>, {data: BodyType<MobileLoginBody>}> = (props) => {
          const {data} = props ?? {};

          return  mobileLogin(data,requestOptions)
        }






  return  { mutationFn, ...mutationOptions }}

    export type MobileLoginMutationResult = NonNullable<Awaited<ReturnType<typeof mobileLogin>>>
    export type MobileLoginMutationBody = BodyType<MobileLoginBody>
    export type MobileLoginMutationError = ErrorType<MobileLogin400 | MobileLogin401 | MobileLogin500>

    /**
 * @summary Exchange credentials for a bearer token.
 */
export const useMobileLogin = <TError = ErrorType<MobileLogin400 | MobileLogin401 | MobileLogin500>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof mobileLogin>>, TError,{data: BodyType<MobileLoginBody>}, TContext>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof mobileLogin>>,
        TError,
        {data: BodyType<MobileLoginBody>},
        TContext
      > => {
      return useMutation(getMobileLoginMutationOptions(options), queryClient);
    }

export const getGetMobileAuthMeUrl = () => {




  return `/api/mobile-auth/me`
}

/**
 * @summary The user for the supplied bearer token.
 */
export const getMobileAuthMe = async ( options?: RequestInit): Promise<GetMobileAuthMe200> => {

  return customFetch<GetMobileAuthMe200>(getGetMobileAuthMeUrl(),
  {
    ...options,
    method: 'GET'


  }
);}





export const getGetMobileAuthMeQueryKey = () => {
    return [
    `/api/mobile-auth/me`
    ] as const;
    }


export const getGetMobileAuthMeQueryOptions = <TData = Awaited<ReturnType<typeof getMobileAuthMe>>, TError = ErrorType<GetMobileAuthMe401>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMobileAuthMe>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetMobileAuthMeQueryKey();



    const queryFn: QueryFunction<Awaited<ReturnType<typeof getMobileAuthMe>>> = ({ signal }) => getMobileAuthMe({ signal, ...requestOptions });





   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getMobileAuthMe>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetMobileAuthMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMobileAuthMe>>>
export type GetMobileAuthMeQueryError = ErrorType<GetMobileAuthMe401>


export function useGetMobileAuthMe<TData = Awaited<ReturnType<typeof getMobileAuthMe>>, TError = ErrorType<GetMobileAuthMe401>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMobileAuthMe>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getMobileAuthMe>>,
          TError,
          Awaited<ReturnType<typeof getMobileAuthMe>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetMobileAuthMe<TData = Awaited<ReturnType<typeof getMobileAuthMe>>, TError = ErrorType<GetMobileAuthMe401>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMobileAuthMe>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getMobileAuthMe>>,
          TError,
          Awaited<ReturnType<typeof getMobileAuthMe>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetMobileAuthMe<TData = Awaited<ReturnType<typeof getMobileAuthMe>>, TError = ErrorType<GetMobileAuthMe401>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMobileAuthMe>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary The user for the supplied bearer token.
 */

export function useGetMobileAuthMe<TData = Awaited<ReturnType<typeof getMobileAuthMe>>, TError = ErrorType<GetMobileAuthMe401>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getMobileAuthMe>>, TError, TData>>, request?: SecondParameter<typeof customFetch>}
 , queryClient?: QueryClient
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetMobileAuthMeQueryOptions(options)

  const query = useQuery(queryOptions, queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  return { ...query, queryKey: queryOptions.queryKey };
}







