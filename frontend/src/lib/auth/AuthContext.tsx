// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

/**
 * Authentication Context
 * Provides auth state and actions throughout the application
 */

import { createContext } from 'react'
import type { AuthContextType } from './types'

/**
 * Auth context with undefined default value
 * Using undefined enforces proper provider usage
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

AuthContext.displayName = 'AuthContext'
