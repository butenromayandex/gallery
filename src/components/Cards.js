import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCards, getProfile, setCards, addCard } from '@sspa/main'

import ImagePopup from "./ImagePopup";
import AddPlacePopup from "./AddPlacePopup";
import Card from "./Card";

import api from "../utils/api";
import '../blocks/card/card.css'
import '../blocks/places/places.css'

function Cards () {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);

  const dispatch = useDispatch()
  const cards = useSelector(getCards)
  const currentUser = useSelector(getProfile)

  useEffect(() => {
    setIsLoading(true)
    api
      .getCardList()
      .then((res) => {
        dispatch(setCards(res))
      })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  function onCardClick (card) {
    setSelectedCard(card)
  }

  function onCardLike (card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    api
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        const newCardsList = cards.map((c) => (c._id === card._id ? newCard : c))
        dispatch(setCards(newCardsList))
      })
      .catch((err) => console.log(err));
  }

  function onCardDelete (card) {
    api
      .removeCard(card._id)
      .then(() => {
        const newCardList = cards.filter((c) => c._id !== card._id)
        dispatch(setCards(newCardList))
      })
      .catch((err) => console.log(err));
  }

  function addPlace (newCard) {
    api
      .addCard(newCard)
      .then((newCardFull) => {
        dispatch(addCard(newCardFull));
        closePopups();
      })
      .catch((err) => console.log(err));
  }

  function handleAddPlacePopup () {
    setIsAddPlacePopupOpen(true)
  }

  function closePopups () {
    setSelectedCard(null)
    setIsAddPlacePopupOpen(false)
  }

  if (isLoading) {
    return (
      <section className="places page__section" style={{textAlign: 'center'}}>
        <h2 style={{color: '#fff'}}>Загрузка...</h2>
      </section>
    )
  }

  return (
    <>
      <section className="places page__section" style={{textAlign: 'right'}}>
        <button className="profile__add-button" type="button" onClick={ handleAddPlacePopup }></button>
      </section>
      <section className="places page__section">
        <ul className="places__list">
          { cards.map((card) => (
            <Card
              key={ card._id }
              card={ card }
              onCardClick={ onCardClick }
              onCardLike={ onCardLike }
              onCardDelete={ onCardDelete }
            />
          )) }
        </ul>
      </section>
      <ImagePopup card={ selectedCard } onClose={ closePopups }/>
      <AddPlacePopup isOpen={ isAddPlacePopupOpen } onClose={ closePopups } onAddPlace={ addPlace }/>
    </>
  )
}

export default Cards