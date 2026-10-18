#!/bin/sh
# Om en om: oud en nieuw, elk RONDES keer, DAGEN dagen; de uitvoer in uit-<naam>-<ronde>.txt
H=/tmp/claude-0/-home-user-Aardschok/96e56fb4-d356-5fb5-894a-463d3f755627/scratchpad/nacht-agent
NIEUW=/home/user/Aardschok/.claude/worktrees/agent-a1e98f203e950c71e
RONDES=${RONDES:-3}
DAGEN=${DAGEN:-10}
for r in $(seq 1 $RONDES); do
  node $H/nacht.cjs $H/oud $DAGEN > $H/uit-oud-$r.txt
  node $H/nacht.cjs $NIEUW $DAGEN > $H/uit-nieuw-$r.txt
done
node $H/vat.cjs $RONDES
