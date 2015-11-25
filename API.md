POST /events/post.entry:monster.thestream$1/streamed
POST /events/post.entry:monster.thestream$1/applause

POST /events/applause/post.entry:monster.thestream$1

GET /events/applause/post.entry:monster.thestream$1
  [{}, {}, {}, {}]

POST /events/streamed/post.entry:monster.thestream$1
POST /events/streamed/post.entry:monster.thestream$1
POST /events/streamed/post.entry:monster.thestream$1
POST /events/streamed/post.entry:monster.thestream$2

GET /events/streamed/post.entry:monster.thestream$1
  [{}, {}, {}]

GET /events/streamed/post.entry:monster.thestream$2
  [{}]

GET /events/streamed/post.entry:monster.thestream$3
  []

GET /events/streamed/post.*:monster.thestream?orderBy=count&fields=uid&fields=count
  [{uid: 1, count: 3}, {uid: 2, count: 1}]

GET /events/streamed/post.*:monster.thestream?from=date&to=date
