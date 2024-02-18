const app = Vue.createApp({
    data() {
        return {
            page: 'login',
            message: null,
            alertActive: null,
            registerForm: {
                email: 'adom112@lll.ru',
                password: '1Pp',
                first_name: 3212313,
                last_name: 32123123
            },
            loginForm: {
                email: 'test1@domain.ru',
                password: 'Pas1'
            },
            token: localStorage.token,
            uploadForm: {
                files: []
            },
            myFiles: [],
            myAccesses: [],
            readFile: {
                name: null,
                file_id: null
            },
            usersAccess: []


        }
    },
    mounted() {
        if (this.token) {
            this.listMyFiles();
        } else {
            this.openPage('login');
        }

    },
    methods: {
        openPage: function (pageName) {
            this.page = pageName;
        },
        register: function () {

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify(this.registerForm);

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
            };

            fetch("http://fm/registration", requestOptions)
                .then((response) => response.json())
                .then((result) => {

                    this.alertActive = 'show';
                    this.message = result.message;

                    if (result.success) {
                        this.openPage('login');
                    }
                })
        },
        login: function () {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify(this.loginForm);

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            fetch("http://fm/authorization", requestOptions)
                .then((response) => response.json())
                .then((result) => {

                    this.message = result.message;
                    this.alertActive = 'show';

                    if (result.success) {
                        this.listMyFiles();
                        localStorage.token = result.token;
                        this.token = result.token;
                    }

                });

        },
        logout: function () {
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${this.token}`);

            const requestOptions = {
                method: "GET",
                headers: myHeaders,
                redirect: "follow"
            };

            fetch("http://fm/logout", requestOptions)
                .then((response) => response.json())
                .then((result) => {

                    this.message = result.message;
                    this.alertActive = 'show';

                    if (result.success) {
                        this.openPage('login');
                        localStorage.removeItem('token');
                        this.token = result.token;
                    }
                })
        },
        fileSelected() {
            if (event.target.files.length)
                this.uploadForm.files = event.target.files;
        },
        uploadFiles: function () {
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${this.token}`);

            const formdata = new FormData();
            for (let i = 0; i < this.uploadForm.files.length; i++) {
                formdata.append('files[]', this.uploadForm.files[i]);
            }

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: formdata,
                redirect: "follow"
            };

            fetch("http://fm/files", requestOptions)
                .then((response) => response.json())
                .then((result) => {
                    message = [];
                    for (let i = 0; i < result.length; i++) {
                        message[i] = result[i].message
                    }
                    this.message = message;
                    this.alertActive = 'show';
                    this.listMyFiles();
                })
        },
        listMyFiles: function () {
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${this.token}`);

            const requestOptions = {
                method: "GET",
                headers: myHeaders,
                redirect: "follow"
            };

            fetch("http://fm/files/disk", requestOptions)
                .then((response) => response.json())
                .then((result) => {
                    this.myFiles = result;
                    this.openPage('myFiles');
                })
        },
        listMyAccesses: function () {
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${this.token}`);

            const requestOptions = {
                method: "GET",
                headers: myHeaders,
                redirect: "follow"
            };

            fetch("http://fm/files/shared", requestOptions)
                .then((response) => response.json())
                .then((result) => {
                    this.myAccesses = result;
                    this.openPage('Accesses');
                })

        },
        deleteFile: function (fileId) {
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${this.token}`);

            const requestOptions = {
                method: "DELETE",
                headers: myHeaders,
                redirect: "follow"
            };

            fetch("http://fm/files/" + fileId, requestOptions)
                .then((response) => response.json())
                .then((result) => {
                    this.message = message;
                    this.alertActive = 'show';
                    this.listMyFiles();
                })

        },
        downloadFile: function (fileId) {
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${this.token}`);

            const requestOptions = {
                method: "GET",
                headers: myHeaders,
                redirect: "follow"
            };

            fetch("http://fm/files/" + fileId, requestOptions)
                .then((response) => response.blob())
                .then((blob) => {
                    const url = window.URL.createObjectURL(blob);

                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'file');

                    document.body.appendChild(link);
                    link.click();

                    document.body.removeChild(link);

                    // Опционально, если вы хотите освободить ресурсы URL-адреса после скачивания
                    URL.revokeObjectURL(url);
                })
                .catch((error) => {
                    console.error("Ошибка при скачивании файла", error);
                });
        },
        openFormEditFile: function (file) {
            this.readFile.name = file.name.split('.').slice(0, -1).join('.');
            this.readFile.file_id = file.file_id;
            this.openPage('editForm');
        },
        editFile: function () {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("Authorization", `Bearer ${this.token}`);

            const raw = JSON.stringify(this.readFile);

            const requestOptions = {
                method: "PATCH",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            fetch("http://fm/files/" + this.readFile.file_id, requestOptions)
                .then((response) => response.json())
                .then((result) => {
                    this.message = result.message;
                    this.alertActive = 'show';
                    if (result.success) {
                        this.listMyFiles();
                    }
                })
                .catch((error) => console.error(error));
        },
        accessForm: function (file_id) {
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${this.token}`);

            const requestOptions = {
                method: "GET",
                headers: myHeaders,
                redirect: "follow"
            };

            fetch("http://fm/files/disk", requestOptions)
                .then((response) => response.json())
                .then((result) => {
                    const item = result.find((elem) => elem.file_id === file_id);
                    console.log(item);
                    this.usersAccess = item.access;
                    this.openPage('editAccess');
                })

        },


    },
}).mount('#app');




