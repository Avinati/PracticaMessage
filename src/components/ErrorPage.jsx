import React from "react";
import Errorpic from '/public/error.png'
import './css/ErrorPage.css'

function ErrorPage() {
    return (
        <>
        <div className="main-content">
        <h1 className="ouch">Ой!</h1>
        <h1 className="wrong">Похоже ваш арбуз разбился!</h1>
        <p className="dis">Описание ошибок</p>
        <img className="err" src={Errorpic} alt="Ошибка" />
        </div>
        </>
    )
}
export default ErrorPage;