import React from 'react';
import styles from './Search.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

interface IProps {
  searchQuery?: string;
  setSearchQuery: (search: string) => void;
}

const Search = ({ searchQuery, setSearchQuery }: IProps) => {
  return (
    <form
      action="#"
      className={styles.search}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <input
        value={searchQuery}
        type="text"
        className={styles.search__input}
        placeholder="Search..."
        onChange={(e: any) => setSearchQuery(e.target.value)}
      />
      <button className={styles.search__button}>
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </button>
    </form>
  );
};

export default Search;
