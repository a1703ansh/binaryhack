import fs from 'fs';
import path from 'path';

const screens = [
  { id: 'dashboard', html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1YzI4NzA1NGFlZjEwNTc2MzI3NzI3MjdmYzc4EgsSBxC6j_Hdmx8YAZIBIgoKcHJvamVjdF9pZBIUQhI4Nzg5MTg1NjE2OTI2MTk4ODQ&filename=&opi=89354086', img: 'https://lh3.googleusercontent.com/aida/AEtjO1USv9vvtZyfNZmSje9QnG1EUarKI2PCnmobWQKhVZ25g1CESvkL0P2wu5tx3_UwwG4wSdI3-FdvvZPANegReKJlcHubdeSQ6HrriLd3HUVWP5Nd4jdUE-6oG8f7smbkuzZ6fOJOmLji_ay_X13ot4DGdBtgsPCF1Wo7xqQ1YFPYaZ6WPBi23qyNJv0iFt3Iskw9XH2rAmZSzGubeKJqkad4u9gKPRq1h-x--bsVpdqXM--lJYr869UbKQ' },
  { id: 'login_monster', html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1YzI4NGJkNTIwZjYwMzMyY2U0OTliMDllODgzEgsSBxC6j_Hdmx8YAZIBIgoKcHJvamVjdF9pZBIUQhI4Nzg5MTg1NjE2OTI2MTk4ODQ&filename=&opi=89354086', img: 'https://lh3.googleusercontent.com/aida/AEtjO1WgIhSHcAi1KqgCF1Yu8KMZbK9uA5a04JilwUybNP89vqmtYXuQpQnheXyTGHLU8CPXYksfni6Jnkyu7J26cI_EK6Txmm8b1eRSa4MJeHAXRrzmaBq48Ze2dHVoGDe8n5pumGMAM2N2MR701-k5Ny9y5cyBj1MxiaqhhTlzq_j3LQ-RM4QyJqi0RJjCU2_v12mwtah0VqVn_Ra00D-xe6nUbvmRrdRNrPqPrdFtg3XotjN-BdH2z5QJkA' },
  { id: 'autosave', html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1YzI4NzYyMDJlNDMwNzc5OWZjMmUyMTBjMDIzEgsSBxC6j_Hdmx8YAZIBIgoKcHJvamVjdF9pZBIUQhI4Nzg5MTg1NjE2OTI2MTk4ODQ&filename=&opi=89354086', img: 'https://lh3.googleusercontent.com/aida/AEtjO1WVZgh2yHQbOq1hp9zQQo8WvToeUA_lZIRf_hFN7Ws0ejiQXSU2DGNDoEbdfuSde1hIAklzTV2LRJSp0H2G6kVKEeyo40ub_Wc5EuP2-puO82N8I0PkfKJHq35DrzUaTquXKgjpGQrmoH5FhU6LA8hYokq8rJYlqZGqdaGi2IUx-bPPLAEw2HnB4qtiuo39UTFtypF4Io3XpCvRBJpyOEmR2-RhKBVmXrj36DFVMnkZrWxH7uW0zEnL8A' },
  { id: 'invest', html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1YzI4NzYzODQxMjUwMmE5YWRlMWNlMjFmZDlmEgsSBxC6j_Hdmx8YAZIBIgoKcHJvamVjdF9pZBIUQhI4Nzg5MTg1NjE2OTI2MTk4ODQ&filename=&opi=89354086', img: 'https://lh3.googleusercontent.com/aida/AEtjO1VutnSeDQ6McSSRrPqoBoWEHK2Y9RfdW1ZqqsQtn2fPLhxz3evy-N4s38AFa7Bs7mEM5_Ovpz5Sl6w3M1Y90NrWrNVwuiRJ1ONqKz-8auwjfjQ_6IAzBLH4ubMsn8JNkvxGTUv5itrSuc1qAQ4KxcbefL6rWUNhNET_tX9EE4T3VyYy3HgS_hRrOvGrZ0YWDmAmZoZ8uNwZGlM2XU90TD9ygpKsze1VHMS3kMVklr6loaQadQ2LeB7gbA' },
  { id: 'tax', html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1YzI4N2Y3NGM1OGIwMzMyYzA5ZDM2MGM1N2M5EgsSBxC6j_Hdmx8YAZIBIgoKcHJvamVjdF9pZBIUQhI4Nzg5MTg1NjE2OTI2MTk4ODQ&filename=&opi=89354086', img: 'https://lh3.googleusercontent.com/aida/AEtjO1Wevyy7MiRXE0zuPCxJS9rHf3wCojoJE3FhU1P0CIRQqiKMXaLYSQ-iz4sEzUW2EiONmJcQ-Y76H75X6bOq6mvh3Rp6IGK8ewNikT4pJexdy_ZemZ1eD8Hnj2j1y3f0ncBWYhZJM0pbrOXnsPN4CnOJ8Q7oUYbYMa2d5gzIx6Nh26DxRZV4PgWGfzmPas1P0BkFJhUaVZeDInaBHBNkFhDO02IMSJspcSeCD9QWy0Pr-fEugbNoONlhSw' },
  { id: 'goals', html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1YzI4N2RhOGUxODUwMmE5YmU0NzMzMzc0NDFhEgsSBxC6j_Hdmx8YAZIBIgoKcHJvamVjdF9pZBIUQhI4Nzg5MTg1NjE2OTI2MTk4ODQ&filename=&opi=89354086', img: 'https://lh3.googleusercontent.com/aida/AEtjO1WGqdmFJ_ULeD8VjRe4p6D2qiy1HCHUdAevuxlzofCPj0UdDv5NZTsfOgOt_aOPC6X4ZqkksT2GY4cW9veaj6dh9aLYOwr7Pr0s3rNCPpwQdmkL8BcanMph_qCmrZmQJZuk_MLLHZhqSIvVtMw_H9sGJ63HxKjxADJAHDB-ofao3Mgy41Zff5UsinCpy4n-14G93ck8vTa0OYkoZ-2_2fN4SlCUuSK8R5CrXcm6u2uro_nvO6ZWQh3Z5w' },
  { id: 'payout', html: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzAwMDY1YzI4N2UwNGFhMWEwNTc2MzI3NzI3MjdmYzc4EgsSBxC6j_Hdmx8YAZIBIgoKcHJvamVjdF9pZBIUQhI4Nzg5MTg1NjE2OTI2MTk4ODQ&filename=&opi=89354086', img: 'https://lh3.googleusercontent.com/aida/AEtjO1XQ6GiESM5nggyuMSO7B60IVAH_-TGJd6I3vHia8bIRyXWT61D7Za6l-S3WvLC9SvQy31vxytgUhPSfrhq8_73yhH44v3sZ57SojrhDIVvx1AecYo_fTeJlnn540d8PryaPlxiR3PCZZ83ggW0aLAQ4_IHKqeSJnmmXWRqBPD8_YhcHr_bcovu4z3CMqP3wKi6NXmZUM7pIxcJbAk4YrQMQtHzb9Nsxq4cP9LfSoZcuq9QsH5Pph1mWbw' }
];

const outDir = path.resolve('stitch_assets');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const s of screens) {
  console.log(`Downloading ${s.id}...`);
  try {
    const resHtml = await fetch(s.html);
    const htmlText = await resHtml.text();
    fs.writeFileSync(path.join(outDir, `${s.id}.html`), htmlText, 'utf-8');
    console.log(`Saved ${s.id}.html (${htmlText.length} bytes)`);

    const resImg = await fetch(s.img);
    const buffer = Buffer.from(await resImg.arrayBuffer());
    fs.writeFileSync(path.join(outDir, `${s.id}.png`), buffer);
    console.log(`Saved ${s.id}.png (${buffer.length} bytes)`);
  } catch (err) {
    console.error(`Error downloading ${s.id}:`, err);
  }
}
