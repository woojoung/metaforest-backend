
'use strict'



const getParam = function (name, defaultValue) {
    const queryString = window.location.search.substring(1)
    if (queryString === '') {
        return defaultValue
    }

    const pairs = queryString.split('&')
    let index = -1
    for (let i = 0; i < pairs.length; ++i) {
        index = pairs[i].indexOf('=')
        if (index === -1) {
            continue
        }

        const pair = []
        pair.push(pairs[i].substring(0, index))
        pair.push(pairs[i].substring(index + 1))

        if (name === decodeURIComponent(pair[0])) {
            return decodeURIComponent(pair[1])
        }
    }

    return defaultValue
}


const Time = function (d) {
    const date = (typeof d == 'undefined') ? new Date() : new Date(d)

    function _addDays(days) {
        date.setDate(date.getDate() + days)
    }

    function _prevMonth() {
        const tmpDate = new Date(date.getFullYear(), date.getMonth(), 1)
        tmpDate.setMonth(tmpDate.getMonth() - 1)

        date.setMonth(date.getMonth() - 1)
        while (tmpDate.getMonth() !== date.getMonth()) {
            _addDays(-1)
        }
    }

    function _nextMonth() {
        const tmpDate = new Date(date.getFullYear(), date.getMonth(), 1)
        tmpDate.setMonth(tmpDate.getMonth() + 1)

        date.setMonth(date.getMonth() + 1)
        while (tmpDate.getMonth() !== date.getMonth()) {
            _addDays(-1)
        }
    }

    function _addMonths(months) {
        if (months < 0) {
            for (let i = 0; i > months; --i) {
                _prevMonth()
            }
        } else if (months > 0) {
            for (let i = 0; i < months; ++i) {
                _nextMonth()
            }
        }
    }

    function _prevYear() {
        const tmpMonth = date.getMonth()

        date.setFullYear(date.getFullYear() - 1)
        if (tmpMonth !== date.getMonth()) {
            _addDays(-1)
        }
    }

    function _nextYear() {
        const tmpMonth = date.getMonth()

        date.setFullYear(date.getFullYear() + 1)
        while (tmpMonth !== date.getMonth()) {
            _addDays(-1)
        }
    }

    function _addYears(years) {
        if (years < 0) {
            for (let i = 0; i > years; --i) {
                _prevYear()
            }
        } else if (years > 0) {
            for (let i = 0; i < years; ++i) {
                _nextYear()
            }
        }
    }

    function _toDateTimeStr() {
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const dayOfMonth = date.getDate().toString().padStart(2, '0')
        const hour = date.getHours().toString().padStart(2, '0')
        const minute = date.getMinutes().toString().padStart(2, '0')
        const second = date.getSeconds().toString().padStart(2, '0')

        return [year, month, dayOfMonth].join('-') + ' ' + [hour, minute, second].join(':')
    }

    function _toUTCStr() {
        return date.toUTCString()
    }

    return {
        addDays: function (days) {
            return _addDays(days)
        },
        addMonths: function (months) {
            return _addMonths(months)
        },
        addYears: function (years) {
            return _addYears(years)
        },
        toDateTimeStr: function () {
            return _toDateTimeStr()
        },
        toUTCStr: function () {
            return _toUTCStr()
        }
    }
}

const xmlHttpRequest = function (method, url, headers, data, withCredentials, loadEventListener) {
    if (['GET', 'POST', 'PUT', 'JSON', 'UPLOAD', 'AWS_S3_PUT', 'MS_AZURE_PUT'].indexOf(method) === -1) {
        alert('XmlHttp.InvalidMethod')
        return
    }

    const xhr = new XMLHttpRequest()

    xhr.addEventListener('error', function () {
        alert('XmlHttp.NetworkError')
    })

    xhr.addEventListener('load', loadEventListener)

    let body = null
    let contentType = ''

    switch (method) {
        case 'GET':
            if (data !== null) {
                url += '?' + data.toString()
            }

            body = null
            method = 'GET'
            contentType = 'application/x-www-form-urlencoded; charset=utf-8'
            break
        case 'POST':
            if (data !== null) {
                body = data.toString()
            }

            method = 'POST'
            contentType = 'application/x-www-form-urlencoded; charset=utf-8'
            break
        case 'JSON':
            if (data !== null) {
                body = JSON.stringify(data)
            }

            method = 'POST'
            contentType = 'application/json; charset=utf-8'
            break
        case 'UPLOAD':
            // browser should put contentType by itself when upload
            body = data

            method = 'POST'
            break
        case 'AWS_S3_PUT':
            body = data

            method = 'PUT'
            contentType = 'application/octet-stream'
            break
        case 'MS_AZURE_PUT':
            body = data

            method = 'PUT'
            contentType = 'application/octet-stream'
            break
    }

    xhr.open(method, url, true)

    xhr.setRequestHeader('Content-Type', contentType)
    for (const key in headers) {
        xhr.setRequestHeader(key, headers[key])
    }

    if (withCredentials === true) {
        xhr.withCredentials = true
        xhr.setRequestHeader('x-ijt', 'true')
    }

    xhr.send(body)
}

const xmlHttpResponse = function (responseText) {
    let response = {
        errCode: 10500,
    }

    try {
        response = JSON.parse(responseText)
    } catch (ex) {
        alert(ex)
    }

    return response
}

const storageGet = function (key, defaultValue) {
    const value = localStorage.getItem(key)
    return value === null ? defaultValue : value
}

const storageSet = function (key, value) {
    localStorage.setItem(key, value)
}

const storageRemove = function (key) {
    localStorage.removeItem(key)
}

const storageClear = function () {
    localStorage.clear()
}

const emailCheck = function (email) {
    let regex=/([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
    return (email !== '' && typeof email !== 'undefined' && regex.test(email));
}
