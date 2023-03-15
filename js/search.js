window.onload = () => {

    //присовоение констант
    const result = document.getElementsByClassName('result')[0]
    const form = document.getElementsByClassName('search')[0]
    const error = document.getElementsByClassName('error')[0]
    const maxReposit = 10

    createRepositTreeBlok = (data) => {
        for (let i = 0; i < data.total_count; i++) {
            if (result.childElementCount == maxReposit) break //ограничитель на позиций результатов поиска
            // создание блока reposit со воложенными блоками avatar и text, в последнем ссылки header и subheader
            const rep = document.createElement('div')
            rep.classList.add('reposit')
            const ava = document.createElement('div')
            ava.classList.add('avatar')
            ava.style.backgroundImage = `url(${data.items[i].owner.avatar_url})`
            const text = document.createElement('div')
            text.classList.add('text')
            const heaerLink = document.createElement('a')
            heaerLink.classList.add('header')
            heaerLink.innerText = data.items[i].name
            heaerLink.setAttribute('href', `${data.items[i].html_url}`)
            heaerLink.setAttribute('target', '_blank')
            const subheaerLink = document.createElement('a')
            subheaerLink.classList.add('subheader')
            subheaerLink.innerText = data.items[i].owner.login
            subheaerLink.setAttribute('href', `${data.items[i].owner.html_url}`)
            subheaerLink.setAttribute('target', '_blank')
            text.appendChild(heaerLink)
            text.appendChild(subheaerLink)
            rep.appendChild(ava)
            rep.appendChild(text)
            result.appendChild(rep)
        }

    }

    // эвент при начале поиска (клик на кнопку или enter)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        // очистка полей рультатов поиска и ошибки
        while (result.firstChild) {
            result.removeChild(result.firstChild);
        }
        error.innerHTML = ""

        // считывание значений с инпута
        const inputsValue = Object.fromEntries(new FormData(e.target)).rep
        const inputsValueSplit = inputsValue.split(" ")

        // отправка запроса на сервер GitHub по полной фразе в поиске
        const response = await fetch(
            `https://api.github.com/search/repositories?q=${inputsValue}`)
        if (response.ok) {
            const data = await response.json()
            switch (true) {
                case data.total_count != 0:
                    createRepositTreeBlok(data)
                default:
                    // Поиск в GitHub по каждому слову в поиске
                    for (let a = 0; a < inputsValueSplit.length; a++) {
                        const response = await fetch(
                            `https://api.github.com/search/repositories?q=${inputsValueSplit[a]}`)
                        let er = 0

                        if (response.ok) {
                            const dataSplit = await response.json()
                            if (data.total_count == dataSplit.total_count) break
                            // вывод "Ничего не найдено!" при отсутвии результата
                            dataSplit.total_count == 0 ? error.innerHTML = "Ничего не найдено!" : ""
                            createRepositTreeBlok(dataSplit)
                        }
                        else {
                            //счетчик обшибки (если по каждой подстроке запроса выдана ошибка от сервера, то отображается "Ошибка!")
                            er++
                            if (er == inputsValueSplit.length) error.innerHTML = "Ошибка!"
                        }
                    }
            }
        }
        else { error.innerHTML = "Ошибка!" }

    })

}

