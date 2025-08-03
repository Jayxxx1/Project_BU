import bcrypt from 'bcryptjs';

const plain = '123456';
const hash = '$2b$10$hHuR38Yilqnu1HtmmMBuye0ci0F.jQ9EH5ZaLQ8tvBnB8fBLs8mUe';

(async () => {
  const newHash = await bcrypt.hash('jay2004', "$2b$10$6HGP68i0kgCqye8e1tIj1.8naitrXNV3u.qQeaaOqQPYBpmlbvpkq");
  console.log(newHash);
  
})();