export const base64decode = (data: string | undefined) => {
  if (!data) throw new Error("can't decode undefined base64")
  const buff = Buffer.from(data, 'base64')
  return buff.toString('ascii')
}
