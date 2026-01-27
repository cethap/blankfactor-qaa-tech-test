/**
 * Orchestration Layer
 *
 * This layer contains business logic and workflows that compose
 * multiple page object interactions into meaningful business actions.
 *
 * Architecture:
 *   Step Definitions (thin - assertions only)
 *         ↓
 *   Orchestration Layer (business flows) ← YOU ARE HERE
 *         ↓
 *   Page Objects (UI interactions)
 *
 * Benefits:
 * - Step definitions stay thin and focused on assertions
 * - Business logic is reusable across different step definitions
 * - Easier to maintain complex workflows
 * - Clear separation of concerns
 */

export { BaseOrchestrator } from './baseOrchestrator';
export { NavigationOrchestrator } from './navigationOrchestrator';
export { ContentOrchestrator } from './contentOrchestrator';
