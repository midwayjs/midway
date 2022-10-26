# Contribute to Midway

Midway is an open source framework that welcomes everyone to contribute to the community, and this article describes how to submit issue, contribution code, documentation, and more to Midway.



## Report problems and submit an issue

If you encounter some problems in the development process and you cannot solve the problems you need to ask developers, we strongly recommend:

- 1. Find relevant problems in the document first
- 2. If you cannot solve it after searching, you can submit an [issue](https://github.com/midwayjs/midway/issues/new).



Please follow the following specifications when submitting the content.

- 1. Explain your purpose clearly in the title or content, either in Chinese or English.
- 2. Describe the following in the content
   - If it is a new requirement, please describe the requirement in detail, preferably with pseudo code implementation.
   - If it is a BUG, please provide reproduction steps, error logs, screenshots, relevant configurations, framework versions, etc. to enable developers to quickly locate the content of the problem
   - If possible, please provide a minimum replicated code warehouse as much as possible for easy debugging.
- 3. Please search for relevant problems before you report them. Make sure you don't open duplicate questions



Developers will mark the problem, reply or solve the problem when they see it.



## Fix code problems

If you find that the framework has some problems to be modified, you can submit them through PR.



### Pull Request

1. First, fork a warehouse in the upper-right corner of [midway github](null) to your own space.

2. git clone The warehouse is developed or repaired in local or other IDE environments.

```bash
# Create a new branch
$git checkout -b branch-name

# Develop and execute tests
$ npm test

$git add . # git add -u to delete files
$git commit -m "fix(role): role.use must xxx"
$git push origin branch-name
```

3. Create a Pull Request and choose to merge your own project branch into the main branch of the target midwayjs/midway.

4. The system will automatically create PR under midway warehouse. After the test passes, the developer will merge the PR.



### Submit specifications

- 1. General PR uses English titles
- 2. The `fix`, `chore`, `feat`, and `docs` fields are used to specify the type of the fix.



## Fix document problems

Similar to ordinary PR, if it is a single document, it can be submitted by quick editing.



### Quick Repair of Single Document

- 1. Open the document that needs to be repaired on the official website and click the [Edit this page](#) link in the lower-left corner.
- 2. Click the "Pen Type" button to enter the editing page
- 3. After editing the content, change the submitted title to `docs: xxxx` and click Submit to create a PR.
- 4. Waiting for developers to merge



### Multiple document repair

Same as normal PR, clone warehouse, submit. Note that the title of the submitted PR is `docs: xxx`.
