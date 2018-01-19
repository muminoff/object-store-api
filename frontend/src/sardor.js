const objects = [
  {
    "id":"535007f7-4b86-498b-91f1-326e9df5679b",
    "name":"kamol",
    "is_dir":true,
    "size":0,
    "content_type":null,
    "etag":null,
    "last_modified":1516293253,
    "parent":null
  },
  {
    "id":"53932394-6405-41c1-a597-1f748a78d940",
    "name":"zulayho",
    "is_dir":true,
    "size":0,
    "content_type":null,
    "etag":null,
    "last_modified":1516293268,
    "parent":null
  },{
    "id":"801e834b-9537-4746-88d3-e9d5f934024b",
    "name":"ahmad.txt",
    "is_dir":false,
    "size":662294,
    "content_type":null,
    "etag":null,
    "last_modified":1516294002,
    "parent":null
  },{
    "id":"49a41ca7-e065-49d9-a987-a125cc9014c5",
    "name":"washington",
    "is_dir":true,
    "size":0,
    "content_type":null,
    "etag":null,
    "last_modified":1516294006,
    "parent":null
  }
]

const compareName = (a, b) => {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}

const dirs = objects.filter(obj => obj.is_dir);
const files = objects.filter(obj => !obj.is_dir);
const dirsSorted = dirs.sort(compareName);
const filesSorted = files.sort(compareName);
dirsSorted.forEach((dir) => {
  console.log(`[${dir.name}]`);
})
filesSorted.forEach((file) => {
  console.log(`${file.name}`);
})
