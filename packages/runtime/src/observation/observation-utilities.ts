export const getPropertyDescriptor = ((gOPD, gPO) => (subject: object, name: string): PropertyDescriptor => {
  let pd = gOPD(subject, name);
  let proto = gPO(subject);

  while (pd === undefined && proto !== null) {
    pd = gOPD(proto, name);
    proto = gPO(proto);
  }

  return pd;
})(Object.getOwnPropertyDescriptor, Object.getPrototypeOf);
