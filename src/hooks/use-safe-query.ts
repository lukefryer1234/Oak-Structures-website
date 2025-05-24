// src/hooks/use-safe-query.ts
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { getErrorMessage, logError } from '@/utils/error-utils';
import { useToast } from '@/hooks/use-toast';

/**
 * Enhanced useQuery hook with better error handling.
 * 
 * This hook:
 * 1. Logs errors to console with context
 * 2. Provides user-friendly error messages
 * 3. Optionally shows error toasts
 */
export function useSafeQuery<
  TData = unknown,
  TError = Error,
  TQueryKey extends unknown[] = unknown[]
>(
  queryKey: TQueryKey,
  queryFn: () => Promise<TData>,
  options: {
    context?: string;
    showErrorToast?: boolean;
    toastTitle?: string;
    queryOptions?: Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>;
  } = {}
): UseQueryResult<TData, TError> {
  const { context = 'query', showErrorToast = false, toastTitle = 'Error', queryOptions = {} } = options;
  const { toast } = useToast();

  return useQuery<TData, TError, TData, TQueryKey>({
    queryKey,
    queryFn,
    ...queryOptions,
    onError: (error) => {
      // Log error with context
      logError(error, context);

      // Show toast if enabled
      if (showErrorToast) {
        toast({
          variant: 'destructive',
          title: toastTitle,
          description: getErrorMessage(error),
        });
      }

      // Call the original onError if provided
      if (queryOptions.onError) {
        queryOptions.onError(error);
      }
    },
  });
}

/**
 * Enhanced useMutation hook with better error handling.
 * 
 * This hook:
 * 1. Logs errors to console with context
 * 2. Provides user-friendly error messages
 * 3. Optionally shows success and error toasts
 */
export function useSafeMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    context?: string;
    showErrorToast?: boolean;
    showSuccessToast?: boolean;
    errorToastTitle?: string;
    successToastTitle?: string;
    successToastMessage?: string | ((data: TData) => string);
    mutationOptions?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>;
  } = {}
): UseMutationResult<TData, TError, TVariables, TContext> {
  const {
    context = 'mutation',
    showErrorToast = true,
    showSuccessToast = false,
    errorToastTitle = 'Error',
    successToastTitle = 'Success',
    successToastMessage = 'Operation completed successfully',
    mutationOptions = {},
  } = options;
  const { toast } = useToast();

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      // Show success toast if enabled
      if (showSuccessToast) {
        const message = typeof successToastMessage === 'function' 
          ? successToastMessage(data) 
          : successToastMessage;
        
        toast({
          title: successToastTitle,
          description: message,
        });
      }

      // Call the original onSuccess if provided
      if (mutationOptions.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Log error with context
      logError(error, `${options.context || 'mutation'}`);

      // Show toast if enabled
      if (showErrorToast) {
        toast({
          variant: 'destructive',
          title: errorToastTitle,
          description: getErrorMessage(error),
        });
      }

      // Call the original onError if provided
      if (mutationOptions.onError) {
        mutationOptions.onError(error, variables, context);
      }
    },
  });
}

