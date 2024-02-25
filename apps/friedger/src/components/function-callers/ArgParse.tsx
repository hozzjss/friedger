import { ClarityValue, noneCV } from "@stacks/transactions"
import { FnArg } from "../../util/stacks-types"
import UintParser from "./parsers/UintParser"
import { FocusEvent, Ref, useEffect, useMemo } from "react"
import StringAsciiParser from "./parsers/StringAsciiParser"
import PrincipalParser from "./parsers/PrincipalParser"
import BoolParser from "./parsers/BoolParser"
import BuffParser from "./parsers/BuffParser"

const getParser = (arg: FnArg) => {
  switch (arg.type) {
    case "uint128":
      return UintParser
    case "bool":
      return BoolParser
    case "principal":
    case "trait_reference":
      return PrincipalParser
    default:
      if (arg.type["string-ascii"]) {
        return StringAsciiParser
      } else if (arg.type.buffer) {
        return BuffParser
      } else {
        return null
      }
  }
}

export default function ArgParse<T extends ClarityValue>({
  arg,
  onChange,
  value,
  inputRef,
  onBlur,
  disabled,
}: {
  arg: FnArg
  onChange: (arg: T) => unknown
  value?: T
  disabled?: boolean
  onBlur: (e: FocusEvent<HTMLInputElement>) => void
  inputRef: Ref<HTMLInputElement>
}) {
  const optionalWrapper = useMemo(() => {
    return (
      arg.type !== "bool" &&
      arg.type !== "principal" &&
      arg.type !== "trait_reference" &&
      arg.type !== "uint128" &&
      arg.type.optional
    )
  }, [arg.type])

  const Parser = useMemo(() => {
    if (optionalWrapper) {
      return getParser({
        name: arg.name,
        type: optionalWrapper,
      })
    }
    return getParser(arg)
  }, [arg, optionalWrapper])

  useEffect(() => {
    if (!value && optionalWrapper) {
      onChange(noneCV() as T)
    }
  }, [optionalWrapper, onChange, value])
  return (
    <div className="flex flex-col">
      <label className="flex flex-col gap-2">
        <span>
          {arg.name}{" "}
          {optionalWrapper ? (
            <span className="text-xs text-gray-500">(optional)</span>
          ) : null}
        </span>
        {Parser ? (
          <Parser
            disabled={disabled}
            inputRef={inputRef}
            name={arg.name}
            onBlur={onBlur}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={onChange as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value={value as any}
          />
        ) : null}
      </label>
    </div>
  )
}
