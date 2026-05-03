import { useCallback, useReducer } from 'react'
import { StateMachineConfig, UseStateMachineReturn } from './types'

export function useStateMachine<T extends string = string, E extends string = string>(
    config: StateMachineConfig<T, E>
): UseStateMachineReturn<T, E> {
    const [state, dispatch] = useReducer(
        (currentState: T, action: { type: 'transition'; event: E }) => {
            const validTransitions = config.transitions[currentState]

            if (!validTransitions) {
                return currentState
            }

            const nextState = validTransitions[action.event]

            if (!nextState) {
                return currentState
            }

            // Call exit action
            config.onExit?.[currentState]?.()

            // Call enter action
            config.onEnter?.[nextState]?.()

            // Call transition handler
            config.onTransition?.(currentState, nextState, action.event)

            return nextState
        },
        config.initial
    )

    const send = useCallback(
        (event: E) => {
            dispatch({ type: 'transition', event })
        },
        []
    )

    const can = useCallback(
        (event: E): boolean => {
            const validTransitions = config.transitions[state]
            return validTransitions ? event in validTransitions : false
        },
        [state, config.transitions]
    )

    const getValidEvents = useCallback((): E[] => {
        const validTransitions = config.transitions[state]
        return validTransitions ? (Object.keys(validTransitions) as E[]) : []
    }, [state, config.transitions])

    return {
        state,
        send,
        can,
        getValidEvents,
    }
}