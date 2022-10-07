export const PERMISSIONS_METADATA_KEY = 'casbin:permission_metadata';

export enum AuthActionVerb {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
}

export enum AuthPossession {
  ANY = 'any',
  OWN = 'own',
  OWN_ANY = 'own|any',
}

export enum AuthAction {
  CREATE_ANY = 'create:any',
  CREATE_OWN = 'create:own',

  UPDATE_ANY = 'update:any',
  UPDATE_OWN = 'update:own',

  DELETE_ANY = 'delete:any',
  DELETE_OWN = 'delete:own',

  READ_ANY = 'read:any',
  READ_OWN = 'read:own',
}
