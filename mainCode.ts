import fs from "fs"
import dotenv from "dotenv"
import { WrikeTask, WrikeContacts, WrikeFolders, ReTask, DataGive } from "./interfaces"

dotenv.config()

let task: DataGive<WrikeTask>;
let contacts: DataGive<WrikeContacts>;
let folders: DataGive<WrikeFolders>;
let token = process.env.WRIKE_TOKEN;
const methodWithHeaders ={
    method: 'GET',
    headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
    }
  }

async function main(): Promise<void> {

  const tasksResp = await fetch(`https://www.wrike.com/api/v4/tasks?fields=["responsibleIds","parentIds"]&pageSize=100`, methodWithHeaders);
  task = await tasksResp.json();

  const contactsResp = await fetch(`https://www.wrike.com/api/v4/contacts`, methodWithHeaders);
  contacts = await contactsResp.json();

  const foldersResp = await fetch(`https://www.wrike.com/api/v4/folders`, methodWithHeaders);
  folders = await foldersResp.json();
  
  const Tasks: ReTask[] = task.data.map(Task);

  folders.data.forEach((folder: WrikeFolders) => {
  Tasks.forEach((element: ReTask) => {
    if (element.collection[0] === folder.id) {
      element.assignees[0] = contacts.data.find((contact: WrikeContacts) => contact.id === element.assignees[0]) || element.assignees[0]
      folder.childIds.push(element.id)
      folder.tasks = []
      folder.tasks!.push(element)
    }
  });})

  const finalFolder: WrikeFolders[] = folders.data

  writeDatas(finalFolder)
}

  function Task(item: WrikeTask): ReTask {
      return {
          id: item.id,
          title: item.title,
          assignees: item.responsibleIds,
          status: item.status,
          collection: item.parentIds,
          created_at: item.createdDate,
          updated_at: item.updatedDate,
          ticket_url: item.permalink
      }
  }

  async function writeDatas(finalFolder: WrikeFolders[]): Promise<void> {
    await fs.promises.writeFile('tasks.json', JSON.stringify(task, null, 2))
    await fs.promises.writeFile('folders.json', JSON.stringify(folders, null, 2))
    await fs.promises.writeFile('contacts.json', JSON.stringify(contacts, null, 2))
    await fs.promises.writeFile('data.json', JSON.stringify(finalFolder, null, 2))
  }

main()